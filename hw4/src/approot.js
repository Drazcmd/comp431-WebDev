import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import Main from './components/Main/main'
import Profile from './components/Profile/profile'
import Landing from './components/Landing/landing'

export const AppRoot = ({ location, update }) => {
    /*
    Reason for the _ is to distinguish it from
    the inputted function 'update.' On a side note,
    the inputted update is defined down in the connect
    area, and it's a lambda that takes the location and
    then dispatches an updateLocation action (which itself
    takes in location as an input) to our reducer.
    */

    //Remember, the 'state' IS the state! So the passed in locatio
    //is actually the current location state. Cool huh? 

    //three if-statement stuff goes here
    console.log(location)
    if (location == 'MAIN_PAGE') {
        return (<Main />)
    } else if (location == 'PROFILE_PAGE') {
        return (<Profile />)
    } else if (location == 'LANDING_PAGE') {
        return (<Landing />)
    } else {
        //Although currently set return landing, I wanted to separate
        //this sitation out - it's really an erroneous situation!
        return (<Landing />)
    }
}

AppRoot.propTypes = {
    location: PropTypes.string.isRequired
}

/*
Connect is for connccting reafct to redux

It's lets us access the state and use the dispatch in the react app (i.e. the code above)
Otherwise when the react changes we wouldn't be able to get it.
React is basically the template, and redux is what holds the actual data/info


Remember, the args to connect are mapStateToProps and mapDispatchToProps
The first of these (the lambda taking state) will be called any time the store
is updated.
The second of these (the lambda taking dispatch) is an object where each
function inside of it is assumed to be a redux action creator. Thsi will wrap
said action creator into a dispatch call so it can be invoked directly, and merge
it into thee component's props. 

So, state down here lets us use state above. Basically all the input args in
the export const AppRoot only work if we say how to get them out of state down
here more or less

Dispatch lets us dispatch
*/
export default connect(
    (state) => ({ location: state.location }),
    (dispatch) => ({ })
)(AppRoot)
