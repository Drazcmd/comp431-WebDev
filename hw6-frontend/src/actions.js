import {loadImageBytestream} from './imageReader'
import {
    resource, getMainData, getProfileData, updateFields, nonJsonResource
} from './serverRequest'

export const MAIN_PAGE = 'MAIN_PAGE'
export const PROFILE_PAGE = 'PROFILE_PAGE'
export const LANDING_PAGE = 'LANDING_PAGE'
export const ERROR = 'ERROR'

export const VisModes = {
    REFRESH : 'REFRESH',
    FIL_AUTH : 'FILTER_BY_AUTHOR',
    FIL_TEXT : 'FILTER_BY_TEXT',
    NO_FILTER : 'NO_FILTER'
}

export const ActionTypes = {
    LOCATION_CHANGE: 'LOCATION_CHANGE',
    UPDATE_STATUS: 'UPDATE_STATUS',
    UPDATE_PROFILE_DATA: 'UPDATE_PROFILE_DATA',
    DOWNLOAD_PROFILE_DATA: 'DOWNLOAD_PROFILE_DATA',
    UPDATE_SHOWN_ARTICLES: 'UPDATE_SHOWN_ARTICLES',
    UPDATE_FOLLOWEES: 'UPDATE_FOLLOWEES',
    LOGOUT: 'LOGOUT',
    LOGIN: 'LOGIN',
    UPDATE_ERROR_MESSAGE: 'UPDATE_ERROR_MESSAGE',
    ADD_COMMENT: 'ADD_COMMENT',
    UPDATE_COMMENT: 'UPDATE_COMMENT'
}

/* 
As a reminder to help explain what on earth all this is for,
"Actions are payloads of information that send data from
your application to your store. They are the only source of information for
the store. You send them to the store using store.dispatch().
...
Actions are plain JavaScript objects. Actions must have a type property that
indicates the type of action being performed.
...
Action creators are exactly that—functions that create actions. It's easy to
conflate the terms “action” and “action creator,” so do your best to use the
proper term.
In Redux action creators simply return an action:
*/

const createLocAction = ((newLocation, fetchedData) => {
    //Might not be fetching data if going to landing, therefore it needs 
    //to work if only passed newLocation as an input arg
    const returnedAction = fetchedData ? {
        ...fetchedData,
        type: ActionTypes.LOCATION_CHANGE,
        newLocation: newLocation
    } : {
        type: ActionTypes.LOCATION_CHANGE,
        newLocation: newLocation
    }
    return returnedAction
})
export const updateLocation = (newLocation) => {
    if (newLocation === MAIN_PAGE) {
        //We need to update two things: the articles and the followee data
        //However, to do the latter, we first need the names of our folowees
        return resource('GET', 'following')
        .then(res => {
            //(the way following works is that it only returns the
            //usernames, not any of the other data (avatar/headline))
            const followeesNames = res.following
            //Now we can actually fetch all our main data
            return getMainData(followeesNames)
        }).then(fetchedData => {
            return createLocAction(newLocation, fetchedData)
        }).catch(error => {
            return dispError(error.message)
        })
    } else if (newLocation === PROFILE_PAGE) {
        //profile data is comparatively much much simpler to fetch
        return getProfileData().then(fetchedData => {
            return createLocAction(newLocation, fetchedData)
        }).catch(error => {
            return dispError(error.message)
        })
    } else {
        //i.e. this means (newLocation === LANDING_PAGE) 
        //should have already logged out before this part!
        return createLocAction(newLocation)
    }
}
export const addArticle = (newArticle, optionalImgFileObj) => {
    if (newArticle.text && optionalImgFileObj) {
        //can't use our standard json approach to http requests for images
        console.log('image article time!', newArticle)
        return new Promise((resolve, reject) => {
            console.log('begining load')
            loadImageBytestream(optionalImgFileObj, resolve, reject)
        })
        .then(fileBytestream => {
            console.log('in next stage of promise - bytsestream is len', fileBytestream.length)
            return nonJsonResource('POST', 'article', newArticle.text, fileBytestream)
        })
        .then(res => {
            console.log('got response!', res)
            console.log('must update articles')
            return updateShownArticles(VisModes.REFRESH)
        }).catch(error => {
            return dispError(error.message) 
        })
    } else if (newArticle.text) {
        console.log('text article time')
        const payload = {
            text: newArticle.text
        }
        //TODO - if there is a way to do a .then on an arbitrarily placed
        //promise, we could remove a couple lines of repeated code below
        return resource('POST', 'article', payload)
        .then(res => {
            return updateShownArticles(VisModes.REFRESH)
        }).catch(error => {
            return dispError(error.message)
        })
    } else {
        return Promise.resolve(dispError("Articles must contain some text"))
    }
}
/**
No, this didn't need to be implemented yet. However, I decided
that I wanted to be able to test my comment display better - and 
unfortunately basically no other people had ocmments working.
*/
export const addComment = (articleId, newComment, commentId) => {
    const payload = {
        text: newComment,
        commentId: commentId
    }
    return resource('PUT', `articles/${articleId}`, payload)
    .then(res => {
        return updateShownArticles(VisModes.REFRESH)
    }).catch(error => {
        return dispError(error.message)
    })
}
export const updateStatus = (newStatus) => {
    const payload = {headline: newStatus}
    return resource('PUT', 'headline', payload)
    .then(res => {
        return { type: ActionTypes.UPDATE_STATUS, newStatus}
    }).catch(error => {
        return dispError(error.message)
    })
}
export const updateProfileData = (fieldValueObjs) => {
    //Delegate to dataFetching.js for the (currently 2) PUT requests
    //Each tuple is of form {fieldToUpdate: valueToBeUpdatedTo}
    return updateFields(fieldValueObjs).then(newProfileData => {
        //And now we update state based off what the server sends back
        //(note that fetchResponses comes from a Promise.all())
        return {
            type: ActionTypes.UPDATE_PROFILE_DATA, 
            newProfileData: newProfileData
        }
    }).catch(error => {
        return dispError(error.message)
    })
}
export const updateShownArticles = (
    visibilityMode, filterStr, optionallyArticles
) => {
    //No matter what operation we're updaitng for, 
    //even if it's just to sort, we might as well refresh the feed
    return resource('GET', 'articles/')
    .then(res => {
        console.log('updating articles!')
        const articles = res.articles
        return {
            type: ActionTypes.UPDATE_SHOWN_ARTICLES,
            visibilityMode, filterStr, articles
        }
    }).catch(error => {
        return dispError(error.message)
    })
}

/**
Followee operations basically require an entire refresh of the data
that is displayed on the main page (articles and followees)
Technically there is some repeated code between these, but
given the way that it's part of the promise chain at best we
wouldn't really be able to re-use more than a line or two. Plus
in the future we don't neccessarily want changing functionality
of one remove to affect add and vice-versa
*/
export const addFollowee = (name, loggedInUser) => {
    //if they exist, we hsould be able to get their headline
    return resource('GET', `headlines/${name}`)
    .then(res => {
        if (res.headlines.length === 0){
            throw new Error(`The requested user '${name}' doesn't exist!`)
        }
        console.log('they exist!', res)
        console.log("OK, TIME TO UPDATE THE FOLLOWING")
        return resource('PUT', `following/${name}`) 
    })
    .then(res => {
        console.log(res, 'TIME TO UPDATE PAGE AFTER THE PUT!!!')
        const resultingFollowees = res.following
        return getMainData(resultingFollowees)
    }).then(fetchedData => {
        //see above note regarding updating articles
        return {
            type: ActionTypes.UPDATE_FOLLOWEES,
            resultingFollowees: fetchedData.followees
        }
    }).catch(error => {
        console.log('uh oh!')
        return dispError(error.message)
    })
}

export const removeFollowee = (name, loggedInUser) => {
    //not as important as on add, since they probably do exist if already added
    //Good to be careful, though
    return resource('GET', `headlines/${name}`)
    .then(res => {
        if (res.headlines.length === 0){
            throw new Error(`The requested user '${name}'doesn't exist!`)
        }
        return resource('DELETE', `following/${name}`)
    }).then(res => {
        const resultingFollowees = res.following
        return getMainData(resultingFollowees)
    }).then(fetchedData => {
        //the component's responsible for dispatching another
        //update articles action after this action
        return {
            type: ActionTypes.UPDATE_FOLLOWEES,
            resultingFollowees: fetchedData.followees
        }
    }).catch(error => {
        return dispError(error.message)
    })
}
//Although possibly successful, it's not actually implemented on
//the server's side - so it'll always display an error msg
export const notifyRegSuccess = (newUser) => {
    const firstHalf = `Your registration inputs were valid, but the `
    const secondHalf = `server's registration feature isn't working yet`
    const msg = firstHalf + secondHalf
    return {type: ActionTypes.UPDATE_ERROR_MESSAGE, message:msg}
}
export const logout = () => {
    return resource('PUT', 'logout')
    .then(res => {
        return updateLocation(LANDING_PAGE)
    }).catch(error => {
        //doesn't really matter since we're logging out :p
        return dispError(error.message)
    })
}

export const login = (username, password) => {
    return resource('POST', 'login', { username, password })
    .then(res => resource('GET', 'headlines/'))
    .then(res => {
      const user = res.headlines[0]
      const message = `you are logged in as ${user.username} "${user.headline}"`
      return updateLocation(MAIN_PAGE)
    })
    .catch(error => {
        const message = `"${error.message || 'Error'}" when logging in`
        return dispError(message)
    })
}

export const updateAvatar = (fileObj) => {
    if (fileObj) {
        console.log('hello!', fileObj)
        //loadImageBytestream is not a promise, but the loading happens asynch
        //so as a workaround I made the callback I pass in return a promise :)
        return new Promise((resolve, reject) => {
            console.log('begining load')
            loadImageBytestream(fileObj, resolve, reject)
        })
        .then(fileBytestream => {
            console.log('in next stage of promise - bytsestream is len', fileBytestream.length)
            return nonJsonResource('PUT', 'avatar', "", fileBytestream)
        })
        .then(response => {
            const newAvatarUrl = response.avatar
            console.log("gota new avatar!", newAvatarUrl)
            return dispError("Update avatar event unimplemented!!!")
        })
        .catch(error => {
            return dispError(error.message)
        })
    } else {
        throw new Error("No avatar image selected")
    }
}

export const updateComment = (commentText, commentId) => {
    console.log('TODO update comment: ', commentText, commentId)
    return {
        type: ActionTypes.UPDATE_COMMENT
    }
}
export const dispError = (message) => {
    return {
        type: ActionTypes.UPDATE_ERROR_MESSAGE, 
        message: message ? message : "some undefined error occurred!"
    }
}
