import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-bootstrap'
import NewFollowers from './NewFollowers'
import Followee from './Followee'
import ErrorDisplay from './../../textDisplay/errorDisplay'

export const followSideBar = ({ followees }) => {
    const profileImgWidth="100"
    const profileImgHeight="75"
    return (
        <Grid>
        {
            followees.map((followee, index) => (
                <Row key={index}>
                <Followee data={followee} key={index} />
                </Row>
            ))
        }
        <Row> <ErrorDisplay /> </Row>
        <Row>
             <div> Follow new people here! </div>
             <NewFollowers />
         </Row>

        </Grid>
    )
}

followSideBar.propTypes = {
}
export default connect(
    (state) => ({ 
        followees: state.followees
    }),
    (dispatch) => ({ })
)(followSideBar)
