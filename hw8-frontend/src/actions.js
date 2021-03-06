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
        return new Promise((resolve, reject) => {
            loadImageBytestream(optionalImgFileObj, resolve, reject)
        })
        .then(fileObjWithBytestream=> {
            return nonJsonResource(
                'POST', 'article', newArticle.text, fileObjWithBytestream
            )
        })
        .then(res => {
            return updateShownArticles(VisModes.REFRESH)
        }).catch(error => {
            return dispError(error.message) 
        })
    } else if (newArticle.text) {
        const payload = {
            text: newArticle.text
        }
        //if there were a way to do a .then on an arbitrarily placed
        //promise, we could remove a couple lines of repeated code below :/
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
* If commentId is -1, will add a new comment. If commentId is
* any other value, it will attempt to edit the comment with that
* number id in the article.
*/
export const putComment = (articleId, newCommentText, commentId) => {
    const payload = {
        text: newCommentText,
        commentId: commentId
    }
    return resource('PUT', `articles/${articleId}`, payload)
    .then(res => {
        return updateShownArticles(VisModes.REFRESH)
    }).catch(error => {
        return dispError(error.message)
    })
}
export const editArticle = (articleId, newArticleText) => {
    //note - if oyu put in the optional commentId, it'd update a comment instead
    const payload = {
        text: newArticleText
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
export const updateProfileData = (fieldValueObj) => {
    //Delegate to dataFetching.js for the (currently 2) PUT requests
    //Each tuple is of form {fieldToUpdate: valueToBeUpdatedTo}
    return updateFields(fieldValueObj).then(newProfileData => {
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
export const updatePassword = (fieldValueObjs) => {
    //Almost identical to updateProfileData, except that there isn't
    //anything we *need* to actually change in the reducer
    return updateFields(fieldValueObjs).then(newProfileData => {
        //And now we update state based off what the server sends back
        //(note that fetchResponses comes from a Promise.all())
        return dispError("WARNING - you just updated your password! Be careful not to forget it!")
    })
    .catch(error => {
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
        return resource('PUT', `following/${name}`) 
    })
    .then(res => {
        const resultingFollowees = res.following
        return getMainData(resultingFollowees)
    }).then(fetchedData => {
        //see above note regarding updating articles
        return {
            type: ActionTypes.UPDATE_FOLLOWEES,
            resultingFollowees: fetchedData.followees
        }
    }).catch(error => {
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
export const register = (newUserInfo) => {
    return resource('POST', 'register', newUserInfo)
    .then(res => login(newUserInfo.username, newUserInfo.password))
    .catch(error => {
        const message = `"${error.message || 'Error'}" when registering`
        return dispError(message)
    })
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
        //loadImageBytestream is not a promise, but the loading happens asynch
        //so as a workaround I made the callback I pass in return a promise :)
        return new Promise((resolve, reject) => {
            //since we pass in the resolve method, no need to 'return' this
            //the input to resolve will be 'x' in '.then((x) => ...)' 
            loadImageBytestream(fileObj, resolve, reject)
        })
        .then(fileObjWithBytestream => {
            //loadImageBytestram call a file API function load the bytestream 
            //into the file object (unfortunately, the API mutates -_-)
            return nonJsonResource('PUT', 'avatar', "", fileObjWithBytestream)
        })
        .then(response => {
            const newAvatarUrl = response.avatar
            return {
                type: ActionTypes.UPDATE_PROFILE_DATA, 
                newProfileData: {img: newAvatarUrl} 
            }
        })
        .catch(error => {
            return dispError(error.message)
        })
    } else {
        throw new Error("No avatar image selected")
    }
}
export const dispError = (message) => {
    return {
        type: ActionTypes.UPDATE_ERROR_MESSAGE, 
        message: message ? message : "some undefined error occurred!"
    }
}
