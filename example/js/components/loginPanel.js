/** @jsx React.DOM */
var React = require("react");

module.exports = React.createClass({
  getInitialState: function () {
    return {
      username: this.props.initialUsername,
      password: this.props.initialPassword
    };
  },

  handleUsernameInput: function (evt) {
    this.props.onInput();
    this.setState({username: evt.target.value});
  },
  handlePasswordInput: function (evt) {
    this.props.onInput();
    this.setState({password: evt.target.value});
  },
  handleSubmit: function (evt) {
    evt.preventDefault();
    this.props.onLogin(this.state.username, this.state.password);
  },

  render:function () {
    var errorDiv;
    if (this.props.errorMessage) {
      errorDiv = <div className="alert-box alert">{this.props.errorMessage}</div>;
    }
    return (
      <form onSubmit={this.handleSubmit} className={this.props.errorMessage? "error" : ""}>
        <fieldset>
          <legend>Admin Login</legend>
          {errorDiv}
          <div className="row">
            <div className="small-12 columns">
              <label>Username
                <input type="text" placeholder="Username" name="username" onChange={this.handleUsernameInput} value={this.state.username}/>
              </label>
            </div>
          </div>
          <div className="row">
            <div className="small-12 columns">
              <label>Password
                <input type="password" placeholder="Password" name="password" onChange={this.handlePasswordInput} value={this.state.password}/>
              </label>
            </div>
          </div>
          <div className="row">
            <div className="small-12 columns">
              <button type="submit" className="button small right">Login</button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }
});
