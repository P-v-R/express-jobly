"use strict";
const { sqlForPartialUpdate, whereClauseBuilder } = require("./sql.js")
const { BadRequestError } = require("../expressError")

const userData = {firstName: 'testchange'}
const userJsToSql = { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin' }
const companyData = {name: 'testcompanyname', description: "this is a test"}
const companyJsToSql = { numEmployees: 'num_employees', logoUrl: 'logo_url' }

describe("SQL for partial update", function () {
    
    test("returns property formatted cols/vals obj for user", function () {
        expect(
          sqlForPartialUpdate(userData, userJsToSql)).toEqual(
                { setCols: '"first_name"=$1', values: [ 'testchange' ]
                });
    });

    test("returns property formatted cols/vals obj for company", function () {
        expect(
            sqlForPartialUpdate(companyData, companyJsToSql)).toEqual(
                {   setCols: '"name"=$1, "description"=$2',
                    values: [ 'testcompanyname', 'this is a test' ]
                  });
      });

      test("returns bad request error with no data", function () {
          try {
            expect(sqlForPartialUpdate({}, userJsToSql))     
        } catch (err){
            expect(err.message).toBe('No data')
            }
      });
});

describe("where clause builder", function(){
  test("all three params are passed (name, minEmployees, maxEmployees)", function(){
    
    expect(whereClauseBuilder({name:"test", minEmployees:10, maxEmployees:100}))
            .toEqual({whereClause:"name ILIKE '%$1%' AND num_employees > $2 AND num_employees < $3", 
                      params:["test", 10, 100]})
    
  })
  test("one params are passed (name)", function(){
    expect(whereClauseBuilder({name:"test"})).toEqual({whereClause:"name ILIKE '%$1%'",
                                                      params:["test"]})
    
  })
  test("one params are passed (minEmployee)", function(){
    expect(whereClauseBuilder({minEmployees:10})).toEqual({whereClause:"num_employees > $1",
                                                          params:[10]})
    
  })
  test("one params are passed (maxEmployee)", function(){
    expect(whereClauseBuilder({maxEmployees:100})).toEqual({whereClause:"num_employees < $1",
                                                           params:[100]})
    
  })
  test("two # employee params are passed (minEmployee, maxEmployee)", function(){
    expect(whereClauseBuilder({minEmployees:10, maxEmployees:100})).
            toEqual({whereClause:"num_employees > $1 AND num_employees < $2",
                                                          params:[10, 100]})
    
  })
  test("name and one # filter passed (name, maxEmployee)", function(){
    expect(whereClauseBuilder({name:"test", maxEmployees:100})).
            toEqual({whereClause:"name ILIKE '%$1%' AND num_employees < $2",
                                                          params:["test", 100]})
    
  })
  test("invalid query arg returns error", function(){
    try{
      expect(whereClauseBuilder({potato:true}))
    } catch(err){
      expect(err)
    }
  })
  test("string passed to minEmployee", function(){
    try{
      expect(whereClauseBuilder({minEmployee:"onehundred"}))
    } catch(err){
      expect(err)
    }
  })

})
