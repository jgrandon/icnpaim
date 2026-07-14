export const mockLti = {
    jwt: {
        sub: 'b9f63c53d1e24581a11d152842901f57',
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2b286722-4ef6-4dda-a756-eec5dca12441',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        iss: 'https://blackboard.com',
        locale: 'es-ES',
        'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
            contact_email: 'soporte_blackboard_staging@udla.cl',
            description: 'Laureate Education Inc.-Chile',
            guid: 'e1303dc9c1ad48398b002ca88da27186',
            name: 'Laureate Education Inc.-Chile',
            url: 'https://udla-staging.blackboard.com/',
            product_family_code: 'BlackboardLearn',
            version: '4000.21.0-rel.5+a0b7d85'
        },
        'https://purl.imsglobal.org/spec/lti/claim/lis': {
            person_sourcedid: 'juan.grandon',
            course_section_sourcedid: 'CLLA01.UDLA.202510_CBI1189SP_1'
        },
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
            document_target: 'window',
            return_url: 'https://udla-staging.blackboard.com/webapps/blackboard/execute/blti/launchReturn?course_id=_89726_1&content_id=_4642715_1&toGC=false&nonce=bb67b5daf3764b37b5c5a35bc766cfc9&launch_id=b3dce0b6-89f2-46a6-86d6-8d05ae78779d&link_id=_4642715_1&launch_time=1784044947414',
            locale: 'es-ES'
        },
        exp: 1784048547,
        iat: 1784044947,
        email: 'jgrandon@udla-servicios.udla.cl',
        given_name: 'JUAN LUIS',
        'https://purl.imsglobal.org/spec/lti/claim/roles': [
            'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
            'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student'
        ],
        nonce: '7dede187-6a99-45ec-b364-7781c4a8c807',
        'https://purl.imsglobal.org/spec/lti/claim/target_link_uri':
            'https://icnpaim-qa.udla.cl/lti13',
        'https://purl.imsglobal.org/spec/lti/claim/context': {
            id: '928daab4dcd0484688289d341c718bb5',
            title: '202510 CBI1189SP FUND. BIO. DE LA PSICOLOGÍA I',
            label: 'CLLA01.UDLA.202510_CBI1189SP_1',
            type: [
                'http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering'
            ]
        },
        'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
            id: '_4642715_1',
            title: 'PAIM LTI'
        },
        'https://purl.imsglobal.org/spec/lti/claim/linkcontentservice': {
            version: [ '1.0' ],
            scopes: [
                'https://purl.imsglobal.org/spec/lti/scope/contentitem.update',
                'https://purl.imsglobal.org/spec/lti/scope/contentitem.read',
                'https://purl.imsglobal.org/spec/lti/scope/contentitem.create'
            ],
            types: [ 'ltiResourceLink' ],
            contentitems: 'https://udla-staging.blackboard.com/learn/api/v1/lti/courses/_89726_1/linkcontent',
            contentitem: 'https://udla-staging.blackboard.com/learn/api/v1/lti/courses/_89726_1/linkcontent/_4642715_1'
        },
        aud: '48dd70cc-ab62-4fbd-ba91-d3d984644373',
        'https://purl.imsglobal.org/spec/lti/claim/message_type':
            'LtiResourceLinkRequest',
        name: 'JUAN LUIS GRANDON MORA',
        family_name: 'GRANDON MORA',
        'https://blackboard.com/lti/claim/one_time_session_token':
            '52db05eecf994c9e837d8c29b6dd9757',
        'https://blackboard.com/webapps/foundations-connector/foundations-ids': {
            'tenant-id': '207a7d60-0f6c-4866-81fc-caa290ddb364',
            'user-id': 'eff4efe9-7655-11f1-bbc4-0530fff21517',
            'course-id': '8bd955c4-00e2-11f0-abbd-a9acc97627b8',
            'site-id': '7963a6b9-3d5e-4250-b214-f9d1be231dcf',
            region: 'us-east-1'
        }
    },
    sessionId: 'mockSessionId',
    bbStudentExternalId: '124',
    bbCourseId: '12'
}