import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import NavButton from '../navigation/navButton'
import { login, logout } from './../../actions'
import { FormGroup, FormControl, ControlLabel, Well, Button } from 'react-bootstrap'
export const Login = ({ dispatchLogin }) => {
    let _username, _password
    const _login = () => {
        dispatchLogin(_username.value, _password.value)
    }
    return (
        <Well>
        <h4>LOGIN: </h4>
        <FormGroup 
            controlId="Login"
        >
            <ControlLabel> Username </ControlLabel>
            <FormControl 
                type="text" name="username"
                placeholder="Enter Username Here"
                inputRef={username=> {_username = username}}
            />
            <ControlLabel> Password </ControlLabel>
            <FormControl 
                type="password" name="password"
                placeholder="Enter Password Here"
                inputRef={password=> {_password = password}}
            />

        </FormGroup>
            <Button bsStyle="primary" name="loginBtn" onClick={ _login }>
                {"Login!"}
            </Button>
    
        </Well>

    )

}

Login.propTypes = {
}

export default connect(
    (state) => ({ }),
    (dispatch) => { 
        return {
            dispatchLogin: (username, password) => {
                login(username, password).then(
                    (resultingAction) => dispatch(resultingAction)
                )
            }
        }
    }
)(Login)
