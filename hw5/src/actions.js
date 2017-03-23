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
    ADD_ARTICLE: 'ADD_ARTICLE',
    UPDATE_STATUS: 'UPDATE_STATUS',
    UPDATE_PROFILE_DATA: 'UPDATE_PROFILE_DATA',
    DOWNLOAD_PROFILE_DATA: 'DOWNLOAD_PROFILE_DATA',
    UPDATE_SHOWN_ARTICLES: 'UPDATE_SHOWN_ARTICLES',
    REMOVE_FOLLOWEE: "REMOVE_FOLLOWEE",
    ADD_FOLLOWEE: "ADD_FOLLOWEE",
    REGISTRATION_SUCCESS: "REGISTRATION_SUCCESS",
    REGISTRATION_FAILURE: "REGISTRATION_FAILURE",
    LOGOUT: "LOGOUT"
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
export const updateLocation = (new_location) => {
	return { type: ActionTypes.LOCATION_CHANGE, location: new_location }
}
export const addArticle = (newArticle) => {
	return { type: ActionTypes.ADD_ARTICLE, newArticle }
}
export const updateStatus = (newStatus) => {
	return { type: ActionTypes.UPDATE_STATUS, newStatus }
}
export const updateProfileData = (newData) => {
    return { type: ActionTypes.UPDATE_PROFILE_DATA, newData }
}
export const updateShownArticles = (visibilityMode, filterStr) => {
	return { 
		type: ActionTypes.UPDATE_SHOWN_ARTICLES,
	 	visibilityMode, filterStr
	}
}
export const removeFollowee = (name) => {
	return {type: ActionTypes.REMOVE_FOLLOWEE, name}
}
export const addFollowee = (name) => {
    return {type: ActionTypes.ADD_FOLLOWEE, name}
}
/* 
Input ought to look something like:
{
    'username' : 'cmd11test',
    'headline' : 'TESTING'
}
*/
export const downloadProfileData = (field, user) => {
    return {type: ActionTypes.DOWNLOAD_DATA, field, user}
}
export const notifyRegSuccess = (newUser) => {
    return {type: ActionTypes.REGISTRATION_SUCCESS, newUser}
}
export const notifyRegFailure = (attemptedUser, failureReason) => {
    return {type: ActionTypes.REGISTRATION_FAILURE, attemptedUser, failureReason}
}
export const logout = () => {
    return updateLocation(LANDING_PAGE)
}