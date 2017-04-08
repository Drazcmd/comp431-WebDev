import { expect } from 'chai'
import { go, sleep, findName, findNames, By } from './selenium'
import common from './common'

const username = common.creds.username
before('should log in', (done) => {
    go().then(sleep(500)).then(common.login).then(done)
})
describe('Test Article Creatoin', () => {
    it('should create a new article and validate article appears in feed', (done) => {
        const newArticle = `A new article ${Math.random()}`
        const postArticle = (msg) => () => {
        	return findName('writeArticle').clear()
            .then(findName('writeArticle').sendKeys(msg))
            .then(findName('writeArticleBtn').click())
            .then(sleep(500))
        }

		const checkArticleInFeed = () => {
			return findNames('article').then(articles => {
				return Promise.all(articles.map((article) => article.getText()))
	        	.then((articleTexts) => {
	        		expect(articleTexts.filter(text => text === newArticle).length).to.eql(1)
	        	})
        	})
		}

        postArticle(newArticle)()
        .then(checkArticleInFeed())
        .then(common.logout)
        .then(common.login)
        .then(checkArticleInFeed())
        .then(common.logout)
        .then(done)
    })
})