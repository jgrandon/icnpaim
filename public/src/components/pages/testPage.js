import React from 'react';

export default class testPage extends React.Component {
  constructor(props) {
    super(props);
    //his.state = { config: {} };
  }

  /*
  componentDidMount() {
    fetch('config')
      .then(result => result.json())
      .then(config => {
        this.setState({ config: config });
      });
  }
      */

  render() {
    return (
      <div>
        <div>
          Haz click y valida que tipo de patinador eres
        </div>
        <button onClick={()=> alert('Lo sentimos, eres QUAD')}>Validar</button>
      </div>    
    );
  }
}