import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { findDOMNode } from 'react-dom'
import { expect } from 'chai'

import { ToDoItem } from './todoItem'

const findByClassname = (children, classname) => {
    const result = Array.prototype.filter.call(children, it => it.className.indexOf(classname) >= 0)
    return result.length ? result[0] : null
}

describe('Validate ToDoItem', () => {

    it('should display a single ToDo with text', () => {
        // use TestUtils.renderIntoDocument
        // findDOMNode and assert 3 children of the ToDoItem element
        // assert the innerHTML of the todo is the text you initially set

        //ToDoItem is a simple component so it needs to be wrapped by a div
        const todoWrapper = TestUtils.renderIntoDocument(
            <div>
            <ToDoItem id={1} text={'hello mah world'} done={false}/>
            </div>
        )
        const todo = todoWrapper.children[0]        
        expect(todo.children).to.have.length(3)
        expect(todo.children[1].innerHTML).to.equal("hello mah world")
    })

    it('should display a single ToDo with no classname', () => {
        // use TestUtils.renderIntoDocument
        // findDOMNode and assert 3 children of the ToDoItem element
        // assert there is no child with classname 'completed'
        const todoWrapper = TestUtils.renderIntoDocument(
            <div>
            <ToDoItem id={3} text={"blah"} done={false}/>
            </div>
        )
        const todo = todoWrapper.children[0]        
        expect(todo.children).to.have.length(3)

        //Needed to turn the htmlcollection into an array (want .forEach)
        const todoChildArr = Array.prototype.slice.call(todo.children)
        todoChildArr.forEach((child) => {
            //console.log(child.className)
            expect(child.className).to.not.equal("completed")
        })
    })

    it('should toggle completed when clicked', () => {
        // use TestUtils.renderIntoDocument
        // when the checkbox is clicked via TestUtils.Simulate.click()
        // we expect the variable toggled to be true
        let toggled = false
        const todoWrapper = TestUtils.renderIntoDocument(
            <div>
            <ToDoItem id={1} text={'hello mah world'} done={false}/>
            </div>
        )
        const todo = todoWrapper.children[0]
        console.log("props",todo.props)
        TestUtils.Simulate.click(todoWrapper)
        console.log(toggled)
    })

    it('should remove an item when clicked', () => {
        let removed = false
        // use TestUtils.renderIntoDocument
        // when the remove button is clicked via TestUtils.Simulate.click()
        // we expect the variable removed to be true
    })

    it('should display a completed ToDo', () => {
        // use TestUtils.renderIntoDocument
        // the item should have done=true
        // assert that the rendered className is "completed"
    })

})
