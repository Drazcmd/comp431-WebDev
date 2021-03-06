/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

/**
Helper code taken from my adventures in inclass-17
*/
const resource = (method, endpoint, payload) => {
    const url = `http://localhost:3000/${endpoint}`
    const options = { method, headers: { 'Content-Type': 'application/json' }}
    if (payload) options.body = JSON.stringify(payload)
    return fetch(url, options).then(r => {
            if (r.status == 200) {
                return r.json()
            } else {    
                const msg = `ERROR ${method} ${endpoint} returned ${r.status}`
                console.error(msg)
                throw new Error(msg)
            }
        })
}

describe('Validate Article functionality', () => {
    it('should give me three or more articles', (done) => {
        resource('GET', "articles").then(body=> {
            expect(body).to.be.ok;
            expect(body.length).to.be.at.least(3);
        }).then(done).catch(function(e){ 
            console.log(e)
        });
    }, 200)

    let firstId;
    const firstArticle = {
        text: 'Bob took a walk today and he played with another dog...'
    } 
    const secondArticle = {
        text: 'Today Mr. Bobby mc bobbyface ate a pie. Sources report it was quite tasty...'
    } 
    it('should add two articles with successive article ids, and return the article each time', (done) => {
        // add a new article
        resource('POST', "article", firstArticle).then(body=> {
        // verify you get the article back with an id
            expect(body).to.be.ok;
            expect(body.id).to.be.ok;
            firstId = body.id
        // verify the content of the article
            expect(body.text).to.be.ok; 
            expect(body.text).to.be.eql(firstArticle.text);
        }).then(done).catch(function(e) {
            console.log(e);
        });
    }, 200)

    it('should add two articles with successive article ids, and return the article each time', (done) => {

        // add a second article
        resource('POST', "article", secondArticle).then(body=> {
        // verify the article id increases by one
            expect(body).to.be.ok;
            expect(body.id).to.be.ok;
            expect(body.id).to.be.eql(firstId + 1);
        // verify the second artice has the correct content
            expect(body.text).to.be.ok; 
            expect(body.text).to.be.eql(secondArticle.text); 
        }).then(done).catch(function(e) {
            console.log(e);
        });
    }, 200)

    it('should return an article with a specified id', (done) => {
        let testArticle;
        resource('GET', "articles").then(body=> {
        // call GET /articles first to find an id, perhaps one at random
            expect(body).to.be.ok;
            expect(body.length).to.be.at.least(1);

            //rather than random I choose the one in the middle
            const arbitraryValue = body.length / 2
            testArticle = body[Math.floor(arbitraryValue)];
            expect(testArticle).to.be.ok
            expect(testArticle.id).to.be.ok
        }).then(done).catch(function(e) {
            console.log(e);
        });

        // then call GET /articles/id with the chosen id
        // validate that only one article is returned
        resource('GET', `articles/${testArticle.id}`).then(body=> {
            expect(body).to.be.ok;
            expect(body.id).to.be.ok;
            expect(body.id).to.be.eql(testID);
            expect(body.text).to.be.ok; 
            expect(body.text).to.be.eql(testArticle.text); 
        }).then(done).catch(function(e) {
            console.log(e);
        });
x   }, 200)

    it('should return nothing for an invalid id', (done) => {
        // call GET /articles/id where id is not a valid article id, perhaps 0
        // confirm that you get no results
        resource('GET', `articles/-2`).then(body=> {
            expect(body).to.not.be.ok;
        }).then(done).catch(function(e) {
            console.log(e);
        });
    }, 200)

});
