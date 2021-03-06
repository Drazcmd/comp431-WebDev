const webdriver = require('selenium-webdriver')

const url = 'http://localhost:8080/index.html'

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build()

exports.driver = driver
exports.By = webdriver.By
exports.findName = name => driver.findElement(webdriver.By.name(name))
exports.findNames = name => driver.findElements(webdriver.By.name(name))
exports.go = _ => driver.navigate().to(url)
exports.sleep = millis => driver.sleep(millis)
