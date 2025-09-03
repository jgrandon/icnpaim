import config from '../config/config';
import assignGrades, { addCol, delCol, readCols, results, scores } from './assign-grades';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import eventstore from './eventstore';
import fs from 'fs';
import path from 'path';
import * as lti from './lti';
import * as db from '../database/db-utility';
import { getCachedToken, getLearnRestToken } from './rest-service';
import { getGroups, groups, groupSets } from './groups';
import { getLTIToken } from './lti-token-service';
import { got_launch } from './content-item';
import { got_launch as lti_got_launch } from './lti';
import { namesRoles } from './names-roles';
import { oidcLogin, verifyToken } from './lti-adv';
import { AGPayload, ContentItem, GroupsPayload, NRPayload } from '../common/restTypes';
import { buildProctoringEndReturnPayload, buildProctoringStartReturnPayload } from './proctoring';
import { handleSubmissionNotice } from './processor';
import { deepLinkContent } from './deep-linking';
import { URL } from 'url';
import apiRoutes from './api-routes';
import wpClient from './wp-client';
import { getUnits } from './handlers/units'
import { getCourse } from './handlers/course'

const contentitem_key = 'contentItemData';

const ltiScopes = 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/score';

const getToolConfig = function(frontendUrl) {
  return {
    application_type: 'web',
    response_types: [ 'id_token' ],
    grant_types: [ 'implict', 'client_credentials' ],
    initiate_login_uri: frontendUrl + 'login',
    redirect_uris: [ frontendUrl + 'lti13' ],
    client_name: 'Virtual Garden',
    'client_name#ja': 'バーチャルガーデン',
    jwks_uri: frontendUrl + '.well-known/jwks.json',
    logo_uri: 'https://static.thenounproject.com/png/1993078-200.png',
    token_endpoint_auth_method: 'private_key_jwt',
    scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score',
    'https://purl.imsglobal.org/spec/lti-tool-configuration': {
      domain: frontendUrl.substring(0, frontendUrl.length - 1).substring(8),
      description: 'Learn Botany by tending to your little (virtual) garden.',
      'description#ja': '小さな（仮想）庭に行くことで植物学を学びましょう。',
      target_link_uri: frontendUrl + 'lti13',
      custom_parameters: {
        userNameLTI: '$User.username',
        userIdLTI: '$User.id',
        contextHistory: '$Context.id.history',
        resourceHistory: '$ResourceLink.id.history',
      },
      claims: [ 'iss', 'sub', 'name', 'given_name', 'family_name' ],
      messages: [
        {
          type: 'LtiDeepLinkingRequest',
          target_link_uri: frontendUrl + 'deepLinkOptions',
          label: 'Add a virtual garden',
          'label#ja': 'バーチャルガーデンを追加する',
          icon_uri: 'https://static.thenounproject.com/png/1993078-200.png',
          custom_parameters: {
            botanical_set: '12943,49023,50013'
          },
          supported_types: [ 'ltiResourceLink' ]
        },
        {
          'type': 'ContextLaunchRequest',
          'label': 'RoboCourse For All',
          'custom_parameters': {}
        }
      ]
    }
  };
};

module.exports = function (app) {
  app.use(cookieParser());
  
  // API routes para integración WordPress
  app.use('/api', apiRoutes);

  const frontendUrl = config.frontend_url;
  const lti11Setup = config.lti11Setup;
  let contentItemData = new ContentItem();
  let ciLoaded = false;

  //=======================================================

  //=======================================================
  // LTI 1.1 provider and caliper stuff
  app.post('/caliper/send', (req, res) => {
    lti.caliper_send(req, res);
  });
  app.post('/caliper/register', (req, res) => {
    lti.caliper(req, res);
  });
  app.post('/caliper', (req, res) => {
    eventstore.got_caliper(req, res);
  });
  app.get('/caliper', (req, res) => {
    eventstore.show_events(req, res);
  });
  app.post('/rest/auth', (req, res) => {
    lti.rest_auth(req, res, lti11Setup.key, lti11Setup.secret);
  });
  app.post('/rest/user', (req, res) => {
    lti.rest_getuser(req, res);
  });
  app.post('/rest/course', (req, res) => {
    lti.rest_getcourse(req, res);
  });
  app.post('/lti/outcomes', (req, res) => {
    lti.outcomes(req, res);
  });
  app.post('/lti/send_outcomes', (req, res) => {
    lti.send_outcomes(req, res);
  });
  app.post('/lti/get_outcomes', (req, res) => {
    lti.get_outcomes(req, res);
  });
  app.get('/lti/membership', (req, res) => {
    lti.get_membership(req, res);
  });
  app.post('/lti', (req, res) => {
    console.log('--------------------\nlti');
    console.log('LTI11 - receive post from Learn LTI launch');
    if (req.body.lti_message_type === 'ContentItemSelectionRequest') {
      got_launch(req, res, contentItemData).then(() => {
        db.insertNewCIM(contentitem_key, contentItemData);
        ciLoaded = true;
        const redirectUrl = `${frontendUrl}content_item`;
        console.log('Redirecting to : ' + redirectUrl);
        res.redirect(redirectUrl);
      });
    }

    if (req.body.lti_message_type === 'basic-lti-launch-request') {
      console.log('insert new state from launch');
      //for lti 1.1 we use the ext_launch_id
      db.insertNewState(req.body.ext_launch_id).then(() => {
        db.insertNewAuthToken(req.body.ext_launch_id, req.body, 'lti11launch')
          .catch(e => console.log(e));
      }).then(() => lti_got_launch(req, res)).catch(e => console.log(e));
    }
  });

  //=======================================================
  // Content Item Message processing
  let passthru_req;
  let passthru_res;
  let passthru = false;

  app.post('/CIMRequest', (req, res) => {
    console.log('--------------------\nCIMRequest');
    if (req.body.custom_option === undefined) {
      // no custom_option set so go to CIM request menu and save req and res to pass through
      // after custom_option has been selected
      passthru_req = req;
      passthru_res = res;
      passthru = true;
      res.redirect('/cim_request');
    } else {
      if (!passthru) {
        // custom_option was set in call from TC so use current req and res
        passthru_req = req;
        passthru_res = res;
        passthru = false;
      } else {
        // custom_option was set from menu so add option and content (if available) to passthru_req
        passthru_req.body.custom_option = req.body.custom_option;
        passthru_req.body.custom_content = req.body.custom_content;
      }
      got_launch(passthru_req, passthru_res, contentItemData)
        .then(() => {
          db.insertNewCIM(contentitem_key, contentItemData);
          ciLoaded = true;

          const redirectUrl = `${frontendUrl}content_item`;
          //console.log('Redirecting to : ' + redirectUrl);
          res.redirect(redirectUrl);
        });
    }
  });

  // Supports LTI dynamic registration
  app.get('/register', async (req, res) => {
    const platformUrl = req.query.openid_configuration;

    if (!platformUrl) {
      res.send('No openid_configuration URL present');
    }

    console.log(`register platformUrl: ${platformUrl}`);
    try {
      const response = await axios.get(platformUrl);
      const platformConfig = response.data;
      console.log(`register response body: ${JSON.stringify(platformConfig)}`);

      // Okay now POST back our config to the platform
      const frontendUrl = config.frontend_url;
      let toolConfig = getToolConfig(frontendUrl);

      const postResponse = await axios.post(platformConfig.registration_endpoint, toolConfig);
      console.log(`register post response status ${postResponse.status}\n${JSON.stringify(postResponse.data)}`);
      res.send(`<div>Got a response ${response.status}</div><div>${JSON.stringify(platformConfig)}</div><button onclick="(window.opener || window.parent).postMessage({subject:'org.imsglobal.lti.close'}, '*')">Close</button>`);
    } catch (err) {
      console.log(`register error ${err}`);
      res.send(err);
    }
  });

  app.get('/contentitemdata', (req, res) => {
    if (!ciLoaded) {
      db.getCIMFromKey(contentitem_key).then(contentData => {
        contentItemData = contentData;
        res.send(contentItemData);
      });
    } else {
      res.send(contentItemData);
    }
  });

  //=======================================================
  // LTI Advantage Message processing
  let users = {
    name: 'Fyodor',
    age: '77'
  };

  // The OIDC login entry point
  app.get('/login', (req, res) => {
    console.log('--------------------\nlogin');
    // Set some cookies for giggles
    res.cookie('userData-legacy', users);
    res.cookie('userData', users, { sameSite: 'none', secure: true });
    oidcLogin(req, res);
  });

  // This is our single redirect_uri entry point; we can use customer parameters or target_link_uri to determine how
  // to route from here
  app.post('/lti13', async (req, res) => {
    console.log('--------------------\nlti13');
    // Per the OIDC best practices, ensure the state parameter passed in here matches the one in our cookie
    const state = req.cookies['state'];
    if (state !== req.body.state) {
      console.log('The state field is missing or doesn\'t match. Maybe cookies are blocked?');
    }
    // Parse, verify and save the id_token JWT
    const jwtPayload = await verifyToken(req.body.id_token);

    const messageType = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    if (messageType === "LtiSubmissionNotice") {
      return handleSubmissionNotice(req, res, jwtPayload);
    } else if (messageType === 'LtiEulaRequest') {
      // Currently mirror the launch payload for custom processor launches
      res.send(jwtPayload);
    } else if (messageType === 'LtiAssetProcessorSettingsRequest') {
      res.send(jwtPayload);
    } else if (messageType === 'LtiReportReviewRequest') {
      res.send(jwtPayload);
    } else {
      await db.insertNewAuthToken(state, jwtPayload, 'jwt');
      //await insertNewAuthToken(state, appInfo.appId, 'client_id');
      const app = db.getAppById(jwtPayload.body.aud);
      // Now we have the JWT but next we need to get an OAuth2 bearer token for REST calls.
      // Before we can do that we need to get an authorization code for the current user.
      // Save off the JWT to our database so we can get it back after we get the auth code.
      const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
      const oneTimeSessionToken = jwtPayload.body['https://blackboard.com/lti/claim/one_time_session_token'];
      const redirectUri = `${config.frontend_url}tlocode`;
      const authcodeUrl = new URL('/learn/api/public/v1/oauth2/authorizationcode', lmsServer);
      authcodeUrl.searchParams.append('response_type', 'code');
      authcodeUrl.searchParams.append('client_id', app.setup.key);
      authcodeUrl.searchParams.append('scope', '*');
      authcodeUrl.searchParams.append('redirect_uri', redirectUri);
      authcodeUrl.searchParams.append('one_time_session_token', oneTimeSessionToken);
      authcodeUrl.searchParams.append('state', state);
      console.log('Adv6 - Redirect to Learn to get 3LO code');
      res.redirect(authcodeUrl);
    }
  });

  // The 3LO redirect route
  app.get('/tlocode', async (req, res) => {
    console.log(`Auth7 - Learn sent back: code: ${JSON.stringify(req.query)}`);
    await db.insertNewAuthToken(req.query.state, req.query.code, 'auth_code');

    const state = req.cookies['state'];
    if (state !== req.query.state) {
      console.log('The state field is missing or doesn\'t match.');
    }
    console.log('Auth8 - using state ' + state);
    const auth = await db.getAuthFromState(state);
    const jwtPayload = auth.jwt;
    const app = await db.getAppById(jwtPayload.body.aud);
    // If we have a 3LO auth code, let's get us a bearer token here.
    const redirectUri = `${config.frontend_url}tlocode`;
    const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const learnUrl = lmsServer + `learn/api/public/v1/oauth2/token?code=${req.query.code}&redirect_uri=${redirectUri}`;

    const restToken = await getLearnRestToken(learnUrl, state, app);
    console.log(`Auth12 - Learn REST token ${JSON.stringify(restToken)}`);

    // Now get the LTI OAuth 2 bearer token (shame they aren't the same)
    await getLTIToken(app.id, app.setup.jwtUrl, ltiScopes, state);

    // Now finally redirect to the UI
    const messageType = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    if (messageType === 'LtiDeepLinkingRequest') {
      res.redirect(`/deep_link_options?nonce=${state}`);
    } else if (jwtPayload.target_link_uri && jwtPayload.target_link_uri.includes('/lti/launch')) {
      // Upsert en WordPress antes de redirigir
      const { wpStudentId, wpCourseId } = await upsertWpEntities(jwtPayload, state);
      // Guardar estado en cookie para el dashboard
      res.cookie('ltiState', state, { sameSite: 'none', secure: true, httpOnly: true });
      // Store WP IDs in session for API routes
      await db.insertNewAuthToken(state, wpStudentId, 'wpStudentId');
      await db.insertNewAuthToken(state, wpCourseId, 'wpCourseId');
      // Redirigir al dashboard
      res.redirect('/dashboard');
    } else if (jwtPayload.target_link_uri.endsWith('lti13bobcat')) {
      res.redirect(`/lti_bobcat_view?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('proctoring')) {
      if (messageType === 'LtiStartProctoring') {
        res.redirect(`/proctoring_start_options_view?nonce=${state}`);
      } else if (messageType === 'LtiEndAssessment') {
        res.redirect(`/proctoring_end_options_view?nonce=${state}`);
      } else {
        res.send(`Unrecognized proctoring message type: ${messageType}`);
      }
    } else if (jwtPayload.target_link_uri.endsWith('lti')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('lti13')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('msteams')) {
      res.redirect(`/ms_teams_view?nonce=${state}`);
    } else {
      // Default: upsert en WordPress y redirigir al dashboard
      const { wpStudentId, wpCourseId } = await upsertWpEntities(jwtPayload, state);
      res.cookie('ltiState', state, { sameSite: 'none', secure: true, httpOnly: true });
      await db.insertNewAuthToken(state, wpStudentId, 'wpStudentId');
      await db.insertNewAuthToken(state, wpCourseId, 'wpCourseId');
      res.redirect(`/dashboard?nonce=${state}`);
    }
  });

  // Función para upsert en WordPress
  const upsertWpEntities = async (jwtPayload, state) => {
    try {
      console.log('=== STARTING WORDPRESS SYNC ===');
      console.log('JWT Payload body:', JSON.stringify(jwtPayload.body, null, 2));
      
      const user = {
        sub: jwtPayload.body.sub,
        email: jwtPayload.body.email,
        name: jwtPayload.body.name || `${jwtPayload.body.given_name} ${jwtPayload.body.family_name}`.trim()
      };

      const context = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/context'];
      const course = {
        contextId: context.id,
        title: context.title,
        label: context.label
      };

      console.log('Extracted user data:', user);
      console.log('Extracted course data:', course);
      
      const student = await wpClient.findOrCreateStudent(user);
      console.log('Student created/updated:', student.id);
      
      const courseWP = await wpClient.findOrCreateCourse(course);
      console.log('Course created/updated:', courseWP.id);
      
      await wpClient.linkStudentToCourse(student.id, courseWP.id);
      console.log('Student-Course link completed');
      
      console.log(`WordPress sync completed - Student ID: ${student.id}, Course ID: ${courseWP.id}`);
      
      return {
        wpStudentId: student.id,
        wpCourseId: courseWP.id
      };
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Full WordPress sync error:', error.response?.data || error);
      // No bloquear el flujo si WP falla
      return { wpStudentId: null, wpCourseId: null };
    }
  };

  app.get('/jwtPayloadData', async (req, res) => {
    try {
      const jwtPayload = await db.getAuthFromState(req.query.nonce).jwt;
      console.log('Auth13 - Nonce matches the state we have so send the jwt');
      res.send(jwtPayload);
    } catch (e) {
      return e;
    }
  });

  app.get('/courseData', async (req, res) => {
    const nonce = req.query.nonce;
    const restToken = await getCachedToken(nonce);
    console.log(`Bobcat - courseData nonce: ${nonce}, restToken: ${restToken}`);
    const jwt = db.getAuthFromState(nonce).jwt;
    const lmsServer = jwt.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const courseUUID = jwt.body['https://purl.imsglobal.org/spec/lti/claim/context']['id'];
    const xhrConfig = {
      headers: { Authorization: `Bearer ${restToken}` }
    };

    try {
      const courseResponse = await axios.get(`${lmsServer}learn/api/public/v2/courses/uuid:${courseUUID}`, xhrConfig);
      console.log(`Bobcat - Got course; Ultra status is ${courseResponse.data.ultraStatus}, and PK1 is: ${courseResponse.data.id}`);
      res.send(courseResponse.data);
    } catch (exception) {
      console.log(`Bobcat - Error getting courseData for ${courseUUID}: ${JSON.stringify(exception)}, from: ${lmsServer}`);
    }
  });

  //=======================================================
  // Deep Linking
  app.get('/dlPayloadData', async (req, res) => {
    const nonce = req.query.nonce;
    const dljwt = await db.getAuthFromState(nonce);
    res.send(dljwt);
  });

  app.post('/deepLinkContent', async (req, res) => {
    console.log('--------------------\ndeepLinkContent');
    const nonce = req.query.nonce;
    const jwtPayload = await db.getAuthFromState(nonce).jwt;
    let dljwt = deepLinkContent(req, res, jwtPayload);
    await db.insertNewAuthToken(nonce, `${dljwt}`, 'dljwt');
    res.redirect(`/deep_link?nonce=${nonce}`);
  });

  //=======================================================
  // Proctoring Service

  app.get('/getProctoringPayloadData', async (req, res) => {
    const nonce = req.query.nonce;
    console.log(`--------------------\ngetProctoringPayloadData nonce: ${nonce}`);
    const jwtPayload = await db.getAuthFromState(nonce).jwt;
    res.send(jwtPayload);
  });

  app.post('/buildProctoringStartReturnPayload', async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await db.getAuthFromState(nonce).jwt;
    buildProctoringStartReturnPayload(req, res, jwtPayload);
    res.redirect('/proctoring_start_actions_view?nonce=${nonce}');
  });

  app.post('/buildProctoringEndReturnPayload', async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await db.getAuthFromState(nonce).jwt;
    buildProctoringEndReturnPayload(req, res, jwtPayload);
    res.redirect('/proctoring_end_actions_view?nonce=${nonce}');
  });

  //=======================================================
  // Names and Roles
  let nrPayload;

  app.post('/namesAndRoles', (req, res) => {
    console.log('--------------------\nnamesAndRoles');
    nrPayload = new NRPayload();
    nrPayload.form = req.body;
    namesRoles(req, res, nrPayload);
  });

  app.post('/namesAndRoles2', (req, res) => {
    nrPayload.url = req.body.url;
    nrPayload.form = req.body;
    namesRoles(req, res, nrPayload);
  });

  app.get('/nrPayloadData', (req, res) => {
    res.send(nrPayload);
  });

  //=======================================================
  // Groups
  let groupsPayload;

  app.post('/groups', (req, res) => {
    console.log('--------------------\ngroups');
    groupsPayload = new GroupsPayload();
    groups(req, res, groupsPayload);
    res.redirect('/groups_view');
  });

  app.get('/groupsPayloadData', (req, res) => {
    res.send(groupsPayload);
  });

  app.post('/getgroups', (req, res) => {
    console.log('--------------------\ngroups');
    groupsPayload.form = req.body;
    getGroups(req, res, groupsPayload);
  });

  let groupSetsPayload;

  app.post('/groupsets', (req, res) => {
    console.log('--------------------\ngroupsets');
    groupSetsPayload = new GroupsPayload();
    groupSets(req, res, groupSetsPayload);
  });

  app.get('/groupSetsPayloadData', (req, res) => {
    res.send(groupSetsPayload);
  });

  //=======================================================
  // Assignments and Grades
  let agPayload;

  app.post('/assignAndGrades', (req, res) => {
    console.log('--------------------\nassignAndGrades');
    agPayload = new AGPayload();
    assignGrades(req, res, agPayload);
    res.redirect('/assign_grades_view');
  });

  app.post('/agsReadCols', (req, res) => {
    console.log('--------------------\nagsReadCols');
    agPayload.url = req.body.url;
    readCols(req, res, agPayload);
  });

  app.post('/agsAddcol', (req, res) => {
    console.log('--------------------\nagsAddCol');
    agPayload.form = req.body;
    addCol(req, res, agPayload);
  });

  app.post('/agsDeleteCol', (req, res) => {
    console.log('--------------------\nagsDeleteCol');
    agPayload.form = req.body;
    delCol(req, res, agPayload);
  });

  app.post('/agsResults', (req, res) => {
    console.log('--------------------\nagsResults');
    agPayload.form = req.body;
    results(req, res, agPayload);
  });

  app.post('/agsScores', (req, res) => {
    console.log('--------------------\nagsScores');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'score');
  });

  app.post('/agsClearScores', (req, res) => {
    console.log('--------------------\nagsClearScores');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'clear');
  });

  app.post('/agsSubmitAttempt', (req, res) => {
    console.log('--------------------\nagsSubmitAttempt');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'submit');
  });

  app.get('/agPayloadData', (req, res) => {
    res.send(agPayload);
  });

  app.get('/config', (req, res) => {
    res.send(config);
  });

  app.get('/.well-known/jwks.json', (req, res) => {
    res.send(config.publicKeys);
  });

  //=======================================================
  // Application Registration processing

  app.get('/applications/all', (req, res) => {
    res.send(db.getAllApplications());
  });

  app.post('/saveSetup', (req, res) => {
    const app = {
      'name': req.body.appName,
      'appId': req.body.appId,
      'appSecret': req.body.appSecret,
      'devPortalUrl': req.body.devPortalUrl,
      'appKey': req.body.appKey
    };
    const result = db.insertNewApp(app);
    res.send(result);
  });

  app.get('/applications/:appId', (req, res) => {
    res.send(db.getAppById(req.params.appId));
  });

  app.delete('/applications/:appId', (req, res) => {
    res.send(db.deleteAppById(req.params.appId));
  });

  app.get('/version', (req, res) => {
    console.log('-------------------\nversion');
    const data = fs.readFileSync('version.json', 'utf8');
    res.send(data);
  });

  // Simple test endpoint para verificar conexión con WordPress
  app.get('/test-wp', async (req, res) => {
    console.log('-------------------\ntest-wp');
    console.log('Environment check:');
    console.log('WORDPRESS_API_USER:', process.env.WORDPRESS_API_USER);
    console.log('WP_PASS configured:', !!process.env.WORDPRESS_API_PASSWORD);
    console.log('WP_API_BASE:', process.env.WP_API_BASE);
    
    try {
      // Test completo de conectividad y permisos
      console.log('Testing WordPress connection...');
      
      // Test 1: Conectividad básica
      const basicResponse = await wpClient.client.get('/');
      console.log('✓ Basic WordPress REST API accessible');
      /*
      // Test 2: Autenticación
      const userResponse = await wpClient.client.get('/users/me');
      console.log('✓ Authentication successful, user:', userResponse.data.name);
      
      // Test 3: CPTs
      const cpts = ['student', 'course', 'unit', 'progress', 'grade'];
      const cptStatus = {};
      
      for (const cpt of cpts) {
        try {
          const cptResponse = await wpClient.client.get(`/debug/${cpt}?per_page=1`);
          cptStatus[cpt] = { status: 'ok', count: cptResponse.data.length };
        } catch (error) {
          cptStatus[cpt] = { 
            status: 'error', 
            error: error.response?.status,
            message: error.response?.data?.message 
          };
        }
      }
      
      // Test 4: Endpoint personalizado
      let customEndpoint = { status: 'not_tested' };
      try {
        const pingResponse = await axios.get('https://icnpaim.cl/wp-json/lti/v1/ping');
        customEndpoint = { status: 'ok', data: pingResponse.data };
      } catch (error) {
        customEndpoint = { 
          status: 'error', 
          message: 'PHP functions not loaded' 
        };
      }
      */
      
      res.json({
        status: 'success',
        message: 'WordPress connection test completed',
        details: {
          basic_api: 'ok',
          authentication: {
            user: userResponse.data.name,
            roles: userResponse.data.roles,
            id: userResponse.data.id
          },
          cpts: cptStatus,
          custom_endpoints: customEndpoint,
          environment: {
            wp_user: process.env.WORDPRESS_API_USER,
            wp_api_base: process.env.WP_API_BASE
          }
        }
      });
      
    } catch (error) {
      console.error('WordPress connection test failed:', error.message);
      console.error('Error details:', error.response?.data);
      res.status(500).json({ 
        status: 'error', 
        message: error.message,
        details: error.response?.data,
        suggestions: [
          'Verify WordPress credentials are correct',
          'Check that user has Editor or Administrator role',
          'Create an Application Password (not regular password)',
          'Verify the PHP functions are loaded in WordPress'
        ]
      });
    }
  });

  app.get('/test-wp-auth', async (req, res) => {
    console.log('-------------------\ntest-wp-auth');
    try {
      console.log('Testing with credentials:');
      console.log('User:', process.env.WORDPRESS_API_USER);
      console.log('Password configured:', !!process.env.WORDPRESS_API_PASSWORD);
      
      const auth = Buffer.from(`${process.env.WORDPRESS_API_USER}:${process.env.WORDPRESS_API_PASSWORD}`).toString('base64');
      console.log('Auth header created, length:', auth.length);
      
      const response = await axios.get('https://icnpaim.cl/wp-json/wp/v2/users/me', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      
      res.json({
        success: true,
        user: response.data.name,
        roles: response.data.roles,
        id: response.data.id
      });
    } catch (error) {
      console.error('Auth test failed:', error.response?.data);
      res.status(500).json({
        error: error.message,
        details: error.response?.data,
        status: error.response?.status,
        suggestion: error.response?.status === 401 ? 'Need Application Password, not regular password' : 'Check WordPress configuration'
      });
    }
  });

  
  app.get('/units',async (req, res) => {
    console.log('-------------------\nunits');
    try {
      const courseName = req.query.code
      // const courseId = /*req.query?.courseId ??*/ 50;
      // const course = (await getCourse(courseName))[0]
      const courseKey = courseName.split(' ')
                                  .splice(0,2)
                                  .join(' ')
      // const { id : courseId } = course
      // const units = await getUnits(courseId)
      const units = await getUnits(courseKey)

      return res.json({
        success: true,
        units
      });
    } catch (error) {
      console.error('get Units failed:', error.response?.data);
      return res.status(500).json({
        error: error.message,
        details: error.response?.data,
        status: error.response?.status,
        suggestion: error.response?.status === 401 ? 'WordPress API Auth error ' : 'Unknown WordPress API error'
      });
    }
  })



  //=======================================================
  // Catch all
  app.get('*', (req, res) => {
    console.log('catchall - (' + req.url + ')');
    res.sendFile(path.resolve('./public', 'index.html'));
  });
};