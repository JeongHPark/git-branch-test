# DPST1093 Major Project

**✨ 👨‍🚀 Mission Control 👩‍🚀 ✨**

## Contents

[[_TOC_]]

## Change Log

 - 30-05-25: updated adminUserDetails, adminUserDetailsUpdate and adminUserPasswordUpdate to start with adminControlUser.

## 🫡 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 🌈 1. Overview

The students at UNSW College are always striving upwards and now have decided that teaching shouldn't be bound to just the seats in their class - they want to hold classes in Space! In order to get there, the students will need something to help plan and resource their trips to this exciting new frontier!

The 25T1 cohort of DPST1093 students will build the **backend Javascript server** for a new mission control platform, **Xecaps**. We plan to task future COMP6080 students to build the frontend for Xecaps, something you won't have to worry about.

**XecapS** is an organisation tool that lets students plan a space mission, add launch vehicles, payloads, mission controllers and astronauts. Then they can simulate how effective their space mission will be in dealing with the various challenges one encounters in a space mission.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

## 🛰️ 2. Iteration 0: Getting Started

**NOTE** We will update this area with an introductionary video soon

<!-- [You can watch the iteration 0 introductory video.](empty) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point. -->


### 🛰️ 2.1. Task

This iteration is designed as a warm-up to help you setup your project, learn Git and project management practises (see Marking Criteria), and understand how your team works together. In this task you will be introduced to two main pieces of information you will need to represent for this system:
 - `Mission Control User` - a `user` who can log onto this system and plan future missions
 - `Space Mission` - a `mission` that a mission control user plans.


In this iteration, you are expected to:
1. Write stub code for the basic functionality of Xecaps. Each function is generally described as a three stage name: access level, then item type being accessed, fially the action to carry out. The basic functionality is defined as the `adminAuth*`, `adminControlUser*`, `adminMission*` capabilities/functions, as per the interface section below (2.2).
    * A stub is a function declaration and sample return value (see example below). **Do NOT write the implementation** for the stubbed functions - that is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 2** function each.
    * Function stub locations should be inside files named a corresponding prefix e.g. `adminAuth` and `adminControl*` inside `auth.js`, `adminMission*` inside `mission.js`
    * Return values should match the interface table below (see example below).
```javascript
// Sample stub for the adminAuthLogin function
// Return stub value matches table below
function adminAuthLogin(email, password) {
  return {
    controlUserId: 1,
  }
}
```
1. Design a structure to store all the data needed for Xecaps, and place this in the [code block](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) inside the `sampledata.md` file. Specifically, you must consider how to store information about **mission control users** and **space missions** and populate ONE example `control user` and `space mission` in your data structure (any values are fine - see example below).
    * Use the interface table (2.2) to help you decide what data might need to be stored. This will require making some educated guesses about what would be required to be stored in order to return the types of data you see. **Whilst the data structure you describe in data.md might be similar to the interface, it is a different thing to the interface.** If you're still confused, think of the interface like a restaurant menu, and `sampledata.md` like where the food is stored in the back. It's all the same food, but the menu is about how it's packaged up and received from the kitchen, and `sampledata.md` is describing the structure of how it's all stored behind the scenes. 
    * As functions are called, this structure would be populated with more mission control users and more space missions, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents.
```javascript
// Example values inside of a 'control user' object might look like this
// NOTE: this object's data is not exhaustive,
// - you may need more/fewer fields stored as you complete this project. 
// We won't be marking you down for missing/adding too much sample data in this iteration.
{
  controlUserId: 1,
  nameFirst: 'James',
  nameLast: 'Tiberius',
  email: 'thisisntmyemail@gmail.com',
}
```
1. Follow best practices for git and teamwork as discussed in lectures.
    * Create a group contract by completing `contract.md` - you may add/edit this template as you see fit.
    * You are expected to have **at least 1 meeting** with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting). We have provided you with a `minutes-template.md` which you may use if you choose.
    * For this iteration each team member will need to make a minimum of **1 merge request per person** in your group into the the default branch (`master` or `main`).
    * **1 merge request per function** must be made (13 in total).
    * Check out the lab on Git from week 1 to get familiar with using Git.

### 🛰️ 2.2. Functions to stub

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `target`.

The following are integers: `controlUserId`, `missionId`.

In terms of file structure:
 * All functions starting with `adminAuth` or `adminControlUser` go in `auth.js`
 * All functions starting with `adminMission` go in `mission.js`
 * `clear` goes in `other.js`

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a mission control user with an email, password, and names, then returns their <code>controlUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  controlUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password returns their <code>controlUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  controlUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminControlUserDetails</code>
      <br /><br />
      Given a mission control user's controlUserId, return details about the user.
      <li>"<code>name</code>" is the first and last name concatenated with a single space between them</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ user:
  {
    controlUserId: 1,
    name: 'Bill Ryker ',
    email: 'strongbeard@starfleet.com.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminControlUserDetailsUpdate</code>
      <br /><br />
      Given a mission control user's controlUserId and a set of properties, update the properties of this logged in mission control user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, email, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminControlUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in control user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionList</code>
      <br /><br />
      Provide a list of all space missions that are owned by the currently logged in control user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ missions: [
    {
      missionId: 1,
      name: 'Mercury',
    },
    {
      missionId: 2,
      name: 'Apollo',
    },
    
  ]
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionCreate</code>
      <br /><br />
      Given basic details about a new space mission, create one for the logged in control user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, name, description, target )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  missionId: 2
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionRemove</code>
      <br /><br />
      Given a particular missionId, permanently remove the space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionInfo</code>
      <br /><br />
      Get all of the relevant information about the current space mission identified by the missionId.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  missionId: 1,
  name: 'Mercury',
  timeCreated: 1683125870,
  timeLastEdited: 1683125871,
  description: 'Place a manned spacecraft in orbital flight around the earth. Investigate man's performance capabilities and his ability to function in the environment of space. Recover the man and the spacecraft safely',
  target: 'Earth orbit'
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionNameUpdate</code>
      <br /><br />
      Update the name of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, name )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionTargetUpdate</code>
      <br /><br />
      Update the target of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>()</code> no parameters
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
    <td>
    </td>
  </tr>
</table>

### 🛰️ 2.3 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>20%</td>
    <td><ul>
      <li>Correct implementation of specified stubs</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Data Model Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing mission control users and space missions, inside of <code>data.md</code>.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful and informative git commit messages being used (see <a href="https://initialcommit.com/blog/git-commit-messages-best-practices#:~:text=commit%20message%20style.-,General%20Commit%20Message%20Guidelines,-As%20a%20general">examples</a>)</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures)</li>
      <li>At least 1 merge request per person and 1 merge request per function (13 in total) made into the <code>default</code> branch</li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>30%</td>
    <td><ul>
      <li>Completed group contract.</li>>
      <li>A generally equal contribution between team members.</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
    </ul></td>
  </tr>
</table>

### 🛰️ 2.4. Dryrun

We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for the automarking component iteration 0.**NOTE** This will only be applicable to Iteration 0 - from Iteration 1 onwards the dryrun will not guarantee the automarking marks, just a sanity check for the presence of all the required functions.

To run the dryrun, you should on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
~dp1093/bin/xecaps/dryrun 0
```

### 🛰️ 2.5. Submission

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

## 🚀 3. Iteration 1: Basic Functionality and Tests

### 🚀 3.1. Task

In this iteration, you are expected to:

1. Write tests for and implement the basic functionality of Xecaps. The basic functionality is defined as the `adminAuth*`,`adminControlUser*`, and `adminMission*` capabilities/functions, as per the interface section below.
    * Test files you add should all be in the form `*.test.js`.
    * Do NOT attempt to try and write or start a web server. Don't overthink how these functions are meant to connect to a frontend yet. That is for the next iteration. In this iteration you are just focusing on the basic backend functionality.

2. Follow best practices for git, project management, and effective teamwork, as discussed in lectures.
    * The marking will be heavily biased toward how well you follow good practices and work together as a team. Just having a "working" solution at the end is not, on its own, sufficient to even get a passing mark.

    * You need to use the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) (or similar) for your task tracking and allocation. Spend some time getting to know how to use the taskboard. If you would like to use another collaborative task tracker e.g. Jira, Trello, Airtable, etc. you must first get approval from your tutor and grant them administrator access to your team board.

    * You are expected to meet regularly with your group and document the meetings via meeting minutes, which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).

    * You should have regular standups and be able to demonstrate evidence of this to your tutor.

    * For this iteration, you will need to collectively make a minimum of **13 merge requests** into `master` or `main`.


### 🚀 3.2. Storing data

Nearly all of the functions will likely have to reference some "data source" to store information. E.g. If you register two control users, create two space missions, all of that information needs to be "stored" somewhere. The most important thing for iteration 1 is not to overthink this problem.

Firstly, you should **not** use an SQL database, or something like firebase.

Secondly, you don't need to make anything persist. What that means is that if you run all your tests, and then run them again later, it's OK for the data to be "fresh" each time you run the tests. We will cover persistence in another iteration.

Inside `src/dataStore.js` we have provided you with an object called `data` which will contain the information that you will need to access across multiple functions. An explanation of how to `get` and `set` the data is in `dataStore.js`. You will need to determine the internal structure of the object. If you wish, you are allowed to modify this data structure.

For example, you could define a structure in a file that is empty, and as functions are called, the structure populates and fills up like the one below:

```javascript
let data = {
    users: [
        {
            controlUserId: 1,
            nameFirst: 'user1',
        },
        {
            controlUserId: 2,
            nameFirst: 'user2',
        },
    ],
    missions: [
        {
            missionId: 1,
            name: 'Mercury',
        },
        {
            missionId: 2,
            name: 'Apollo',
        },
    ],
}
```
### 🚀 3.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
1. Write function stub/s for your feature. This may have been completed in iteration 0 for some functions.
1. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
1. Implement that feature.
1. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
1. Create a merge request for the branch.
1. Get someone in your team who **did not** work on the feature to review the merge request.
1. Fix any issues identified in the review.
1. After merge request is **approved** by a different team member, that team member or the merge request author can merge the merge request into `master` or `main`.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.js`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature is implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing your implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* Merging in merge requests with failing tests is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development, it is something you will be **penalised** for in marking.
* Similarly, merging in branches with untested features is also **bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` or `main` is not possible for this repo. The only way to get code into `master` or `main` is via a merge request. If you discover you have a bug in `master` or `main` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 🚀 3.4. Testing guidelines & advice

#### 🚀 3.4.1. Test Structure
The tests you write should be as small and independent as possible. This makes it easier to identify why a particular test may be failing. Similarly, try to make it clear what each test is testing for. Meaningful test names and documentation help with this. An example of how to structure tests has been done in:

* `src/echo.js`
* `src/echo.test.js`

_The echo functionality is tested, both for correct behaviour and for failing behaviour. As echo is relatively simple functionality, only 2 tests are required. For the larger features, you will need many tests to account for many different behaviours._

#### 🚀 3.4.2. Black Box Testing

Your tests should be *black box* unit tests:
  * Black box means they should not depend your specific implementation, but rather work with *any* faithful implementation of the project interface specification. I.e. you should design your tests such that if they were run against another group's backend they would still pass.
  * For iteration 1, you should *not* be importing the `data` object itself or directly accessing it via the `get` or `set` functions from `src/dataStore.js` inside your tests.
  * Unit tests mean the tests focus on testing particular functions, rather than the system as a whole. Certain unit tests will depend on other tests succeeding. It's OK to write tests that are only a valid test if other functions are correct (e.g. to test `mission` functions you can assume that `auth` is implemented correctly).

This will mean you will use code like this to test login, for instance:

```javascript
let result = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'James', 'Kirk')
adminAuthLogin('validemail@gmail.com', '123abc!@#') // Expect to work since we registered
```

#### 🚀 3.4.3. Resetting state

You should reset the state of the application (e.g. deleting all users, missions, etc.) at the start of every test. That way you know none of them are accidentally dependent on an earlier test. You can use a function for this that is run at the beginning of each test (hint: `clear`).

#### 🚀 3.4.4. Other help

* If you find yourself needing similar code at the start of a series of tests, consider using Jest's [**beforeEach**](https://jestjs.io/docs/api#beforeeachfn-timeout) to avoid repetition.

Sometimes you may ask "What happens if X?". In cases where we don't specify behaviour, we call this **undefined behaviour**. When something has undefined behaviour, you can have it behave any reasonable way you want - because there is no expectation or assumption of how it should act.

A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

#### 🚀 3.4.5 Pipelines

For this iteration, we have provided a CI pipeline file which will work whenever a merge request or a push is made to the default (`master` or `main`) branch. You may use this pipeline as a sanity check for whether or not a merge should be approved.

A pipeline that has failed will show a red ❌ symbol, while a pipeline has succeeded will show a ✅ symbol. If a pipeline fails, as an approver, you should not merge it and instead inform the merge author of the situation.

If you are merging code that is failing because the tests rely on other functions that are not performing correctly, then you should *temporarily* change your tests to `test.skip()` or `describe.skip()` until the functions upon which your tests rely are completed and passing their pipelines. It is recommended that you create a new list in your issue board for `Awaiting testing` if you choose this option.

### 🚀 3.5. Iteration 1 Interface

The functions required for iteration 1 are described below.

All error cases should return <code>{error: 'specific error message here'}</code>, where the error message in quotation marks can be anything you like (this will not be marked).

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `target`, `oldPassword`, `newPassword`.

The following are integers: `controlUserId`, `missionId`, `numFailedPasswordsSinceLastLogin`, `numSuccessfulLogins`, `timeCreated` `timeLastEdited`.

For timestamps, these are unix timestamps in seconds. You can find more information that here https://en.wikipedia.org/wiki/Unix_time

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Error returns</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a mission control user with an email, password, and names, then returns their <code>controlUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ controlUserId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address is used by another user.</li>
        <li>Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).</li>
        <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameFirst is less than 2 characters or more than 20 characters.</li>
        <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameLast is less than 2 characters or more than 20 characters.</li>
        <li>Password is less than 8 characters.</li>
        <li>Password does not contain at least one number and at least one letter.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered mission control user's email and password returns their <code>controlUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ controlUserId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address does not exist.</li>
        <li>Password is not correct for the given email.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminControlUserDetails</code>
      <br /><br />
      Given a mission control user's controlUserId, return details about the user.
      <li>"name" is the first and last name concatenated with a single space between them.</li>
      <li>numSuccessfulLogins includes logins direct via registration, and is counted from the moment of registration starting at 1.</li>
      <li>numFailedPasswordsSinceLastLogin is reset every time they have a successful login, and simply counts the number of attempted logins that failed due to incorrect password, only since the last login.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ user:
  {
    controlUserId,
    name,
    email,
    numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin,
  }
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
    </td>
  </tr>
  <tr>
  <td>
    <code>adminControlUserDetailsUpdate</code>
    <br /><br />
    Given a mission control user's controlUserId and a set of properties, update the properties of this logged in admin user. 
  </td>
  <td>
    <b>Parameters:</b><br />
    <code>( controlUserId, email, nameFirst, nameLast )</code>
    <br /><br />
    <b>Return type if no error:</b><br />
    <code>{ }</code>
  </td>
  <td>
    <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
    <ul>
      <li>controlUserId is not a valid user.</li>
      <li>Email is currently used by another user (excluding the current authorised user)</li>
      <li>Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail)</li>
      <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameFirst is less than 2 characters or more than 20 characters</li>
      <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameLast is less than 2 characters or more than 20 characters</li>
    </ul>
  </td>
  </tr>
  <tr>
  </td>
    <td>
      <code>adminControlUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
        <li>Old Password is not the correct old password</li>
        <li>Old Password and New Password match exactly</li>
        <li>New Password has already been used before by this user</li>
        <li>New Password is less than 8 characters</li>
        <li>New Password does not contain at least one number and at least one letter</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionList</code>
      <br /><br />
      Provide a list of all space missions that are owned by the currently logged in mission control user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ missions: [
    {
      missionId,
      name,
    }
  ]
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionCreate</code>
      <br /><br />
      Given basic details about a new mission, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, name, description, target )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ missionId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in user for another mission.</li>
        <li>Description is more than 400 characters in length (note: empty strings are OK).</li>
        <li>Target is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionRemove</code>
      <br /><br />
      Given a particular space mission, permanently remove the space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
        <li>mission ID does not refer to a valid space mission.</li>
        <li>mission ID does not refer to a space mission that this mission control user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionInfo</code>
      <br /><br />
      Get all of the relevant information about the current space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{
  missionId,
  name,
  timeCreated,
  timeLastEdited,
  description,
  target,
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid mission control user.</li>
        <li>mission ID does not refer to a valid space mission.</li>
        <li>mission ID does not refer to a space mission that this mission control user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionNameUpdate</code>
      <br /><br />
      Update the name of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, name )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid user.</li>
        <li>mission ID does not refer to a valid space mission.</li>
        <li>mission ID does not refer to a space mission that this mission control user owns.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in mission control user for another space mission.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid mission control user.</li>
        <li>mission ID does not refer to a valid space mission.</li>
        <li>mission ID does not refer to a space mission that this mission control user owns.</li>
        <li>Description is more than 400 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminMissionTargetUpdate</code>
      <br /><br />
      Update the target of the relevant space mission.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( controlUserId, missionId, target )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>controlUserId is not a valid mission control user.</li>
        <li>mission ID does not refer to a valid space mission.</li>
        <li>mission ID does not refer to a space mission that this mission control user owns.</li>
        <li>Target is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
    </td>
  </tr>
</table>

### 🚀 3.6. Authorisation

Elements of securely storing passwords and other tricky authorisation methods are not required for iteration 1. You can simply store passwords plainly, and use the user ID to identify each user. We will discuss ways to improve the quality and methods of these capabilities in the later iterations.

Note that the `controlUserId` variable is simply the user ID of the user who is making the function call. For example,
* A mission control user registers an account with Xecaps and is assigned some integer ID, e.g. `42` as their user ID.
* When they make subsequent calls to functions, their user ID - in this case, `42` - is passed in as the `controlUserId` argument.

Since `controlUserId` refers to the user ID of the user calling the functions, you do NOT need to store separate user IDs (e.g. a uId or userId + a controlUserId) to identify each user in your data structure - you only need to store one user ID. How you name this user ID property in your data structure is up to you.

### 🚀 3.7. Working in parallel

This iteration provides challenges for many groups when it comes to working in parallel. Your group's initial reaction will be that you need to complete registration before you can complete mission creation, and then mission creation must be done before you update a mission name, etc.

There are several approaches that you can consider to overcome these challenges:

* Have people working on down-stream tasks (like the mission implementation) work with stubbed versions of the up-stream tasks. E.g. The register function is stubbed to return a successful dummy response, and therefore two people can start work in parallel.
* Co-ordinate with your team to ensure prerequisite features are completed first (e.g. Giuliana completes `adminAuthRegister` on Monday meaning Hayden can start `adminMissionCreate` on Tuesday).
* You can pull any other remote branch into your own using the command `git pull origin <branch_name>`.
    * This can be helpful when two people are working on functions on separate branches where one function is a prerequisite of the other, and an implementation is required to keep tests from failing.
    * You should pull from `master` or `main` on a regular basis to ensure your code remains up-to-date.

### 🚀 3.8. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>40%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
    </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria. Each group member will receive an individual mark.
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      Develop tests that show a clear demonstration of:
      <ul>
        <li>Good test <b>coverage</b> - how well you cover the use cases (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria. Each group member will receive an individual mark.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
        <li>Appropriate style as covered so far in introductory programming.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria. Each group member will receive an individual mark.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>35%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>For particular features, committing the bulk of your tests prior to your implementation.</li>
        <li>Your git commit messages are meaningful, clear, informative, and follow the conventional commits structure</li>
        <li>You contribute at least 2 meaningful merge requests (approved by another team member) that merge your branch code to master.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check ins every week.</li>
        <li>Effective use of course-provided MS Teams for effective communication with your group.</li>
        <li>Use of issue board on Gitlab OR another equivalent tool that is used to effectively track your tasks.</li>
        <li>Attendance and contributions at your teams standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
      </ul>
    </td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 6 below.

The formula used for automarking in this iteration is:

`Mark = t * i` (Mark equals `t` multiplied by `i`).

Where:
 * `t` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).

### 🚀 3.9. Dryrun

We have provided a very simple dryrun for iteration 1 consisting of a few tests, including your implementation of `adminAuthRegister`, `adminAuthLogin`, `adminMissionCreate`. These only check the format of your return types and simple expected behaviour, so do not rely on these as an indicator of the correctness of your implementation or tests.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and then copy the iteration 1 dryrun test into your src folder.

To copy dryrun tests, you can run the following command on CSE machines:
```bash
cp ~dp1093/bin/xecaps/iter1.test.js .
```

Then you can run this as a normal `jest` test.

Tips to ensure dryrun runs successfully:
* Files sit within the `/src` directory.

### 🚀 3.10. Submission & Peer Assessment

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **peer assessment**.

## 📡 4. Iteration 2: Building a Web Server and SDLC Requirements

### 📡 4.1. Task

In this iteration, more features were added to the specification, and the focus has been changed to HTTP endpoints. Most of the theory surrounding iteration 2 is covered in week 4-5 lectures.

Iteration 2 both reuses a lot of work from iteration 1, as well as has new work. Most of the work from iteration 1 can be recycled as part of the logic layer. In Iteration 2, we divide our program into three layers - HTTP, logic and data. The iteration 1 tasks can be used in the logic layer after the data layer has been adapted. Then an HTTP layer can be built on top of the logic layer.

In this iteration, you are expected to:

1. Make adjustments to your existing code as per any feedback given by your tutor for iteration 1.
2. Migrate to Typescript by changing `.js` file extensions to `.ts`.
3. Implement and test the HTTP Express server according to the [entire interface provided in the specification](swagger.yaml).

    * Part of this section may be automarked.

    * Your implementation should build upon your work in iteration 1, and ideally your HTTP layer is just a wrapper for underlying functions you've written that handle the logic, see week 4 content.

    * Your implementation will need to include persistence of data (see section 4.7).

    * Introduce user sessions for your login system (see 4.9).

    * You can structure your tests inside a `/tests` folder (or however you choose), as long as they are appended with `.test.ts`. For this iteration and iteration 3 we will only be testing your HTTP layer of tests. You may still wish to use your iteration 1 tests and simply wrap up them - that is a design choice up to you. An example of an HTTP test can be found in section 4.4.

    * You do not have to rewrite all of your iteration 1 tests as HTTP tests - the latter can test the system at a higher level. For example, to test a success case for `POST /v1/admin/mission/{missionid}/transfer` via HTTP routes you will need to call `POST /v1/admin/auth/register` and `POST /v1/admin/mission`; this means you do not need the success case for those two functions seperately. Your HTTP tests will need to cover all success/error conditions for each endpoint, however.

4. Ensure your code is linted to the provided style guide.

    * `eslint` should be added to your repo via `npm` and then added to your `package.json` file to run when the command `npm run lint` is run. The provided `.eslintrc.json` file is *very* lenient, so there is no reason you should have to disable any additional checks. See section 4.6 below for instructions on adding linting to your pipeline.

    * You are required to edit the `gitlab-ci.yml` file, as per section 4.5 to add linting to the code on the default branch (`master` or `main`). **You must do this BEFORE merging anything from iteration 2 into the default branch (`master` or `main`)**, so that you ensure the default branch (`master` or `main`) is always stable.

5. Continue demonstrating effective project management and effective git usage.

    * You will be heavily marked for your use of thoughtful project management and use of git effectively. The degree to which your team works effectively will also be assessed. This iteration we will be enforcing a new git message policy.

    * As for iteration 1, all task tracking and management will need to be done via the GitLab Issue Board or another tracking application approved by your tutor.

    * As for iteration 1, regular group meetings must be documented with meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo wiki after each meeting).

    * As for iteration 1, you must be able to demonstrate evidence of regular standups. We will provide a standup meeting template to help with this.

    * You are required to regularly and thoughtfully make merge requests for the smallest reasonable units, and merge them into the default branch (`master` or `main`).

6. Remove any type errors in your code and ensure it is typesafe

    * Run `npm run tsc` and incrementally fix all type errors.
    
    * Either choose to change one file at a time, or change all file extensions and use `// @ts-nocheck` at the beginning of select files to disable checking on that specific file, omitting errors.

    * If your code is not type-compliant, you receive a 10% penalty. This applies to the entire group, so ensure you are using type-compliant code. To note:
      * Groups who ensure their code are type-safe tend to perform much better in the automarker.

7. Carry out Software Development Life Cycle (SDLC) Requirements related tasks

    * Develop an expected stakeholder list for this project, considering:
      * Who would be the target end users of this system?
      * What types of roles would they occupy (e.g. admin, mission controller, astronaut, etc.)
    * What requirements is our current system trying to achieve, considering:
      * What can be understood from the specification
      * What assumptions can you infer
    * Develop a questionnaire with 3 questions that you can ask your collegues about what they think a space mission control system might need, collect responses from at least:
      * One response from someone in your tutorial
      * One response from someone else in the course not in your tutorial
      * One response from someone else who may have a good understanding (like an Engineering or Science student or professional)
    * From the received responses, identify possible user stories from each respondant (at least 1 from each, minimum 3 total) and develop a set of user acceptance criteria (UAC) for these stories.
      * You should have at least 1 example of each:
        * Rules-oriented UAC; and
        * Scenario-oriented UAC
      * Ask your original respondants if your accept criteria satisfies the user story, and any comments they may have. Note that the UAC check does not have to be positive, it can be a negative response with provided reasoning.
    * Select a single user story and develop a Use Case
      * Create a Text-based representation; and
      * Create a Diagramatic representation

**Note** :: All team members should participate in the coding and SDLC tasks.

In this iteration we also expect for you to improve on any feedback left by tutors in iteration 1.

### 📡 4.2. Running the server

To run the server you can the following command from the root directory of your project:

```bash
npm start
```

This will start the server on the port in the src/server.ts file, using `ts-node`.

If you get an error stating that the address is already in use, you can change the port number in `config.json` to any number from `49152` to `65535`. Is it likely that another student may be using your original port number. We recommend that you use the format `49xxx` where `xxx` is the last 3 digits of your zID. E.g. if your zID is `5000123`, then you should change the port number in `config.json` to be `49123`

Do **NOT** move the location of either `config.json` or `server.ts`

### 📡 4.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
2. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
3. Implement that feature.
4. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
5. Create a merge request for the branch.
6. Get someone in your team who **did not** work on the feature to review the merge request. When reviewing, **not only should you ensure the new feature has tests that pass.** but you should also evaluate their correctness and completeness against the spec.
7. Fix any issues identified in the review.
8. Merge the merge request into default branch.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.ts`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature be implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing your implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* You should have black-box tests for all tests required (i.e. testing each function/endpoint).
* Merging in merge requests with failing pipelines is **very bad practice**. Not only does this interfere with your teams ability to work on different features at the same time, and thus slow down development, it is something you will be penalised for in marking.
* Similarly, merging in branches with untested features is also **very bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to the default branch (`master` or `main`) is not possible for this repo. The only way to get code into the default branch (`master` or `main`) is via a merge request. If you discover you have a bug in the default branch (`master` or `main`) that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 📡 4.4. Testing the interface

In this iteration, **the layer of abstraction has changed to the HTTP level**, meaning that you are only required to write integration tests that check the HTTP endpoints, rather than the style of tests you write in iteration 1 where the behaviour of the Javascript functions themselves was tested.

You will need to check as appropriate for each success/error condition:
* The return value of the endpoint;
* The behaviour (side effects) of the endpoint; and
* The status code of the response.

An example of how you would now test the echo interface is in `newecho.test.ts`.

### 📡 4.5. Testing time-based properties

Some routes will have timestamps as properties. The tricky thing about timestamps is that the client makes a request at a known time, but there is a delay between when the client sends the request and when the server processes it. E.G. You might send an HTTP request to create a space mission, but the server takes 0.3 seconds until it actually creates the object, which means that the timestamp is 0.3 seconds out of sync with what you'd expect.

To solve this, when checking if timestamps are what you would expect, just check that they are within a 1 second range.

E.G. If I create a space mission at 12:22:21pm I will then check in my tests if the timestamp is somewhere between 12:22:21pm and 12:22:22pm.

### 📡 4.6. Continuous Integration

With the introduction of linting to the project with `ESlint`, you will need to manually edit the `gitlab-ci.yml` file to lint code within the pipeline. This will require the following:
 * Addition of `npm run lint` as a script under a custom `linting` variable, apart of `stage: checks`.

Refer to the lecture slides on continuous integration to find exactly how you should add these.

### 📡 4.7. Storing data

You are required to store data persistently in this iteration.

Modify your backend such that it is able to persist and reload its data store if the process is stopped and started again. The persistence should happen at regular intervals so that in the event of unexpected program termination (e.g. sudden power outage) a minimal amount of data is lost. You may implement this using whatever method of serialisation you prefer (e.g. JSON).

Also keep in mind that sensitive data (such as passwords) should not be stored in `plaintext`. This means that if someone inspects your data layer, they should not be able to infer sensitive information such as passwords.

The easiest way to do this is to store `hashed` passwords using the `crypto` library, then comparing any input passwords using the same hashing function.

### 📡 4.8. API Versioning

You might notice that some routes are prefixed with `v1`. Why is this? When you make changes to specifications, it's usually good practice to give the new function/capability/route a different unique name. This way, if people are using older versions of the specification they can't accidentally call the updated function/route with the wrong data input. If we make changes to these routes in iteration 3, we will increment the version to `v2`.

Hint: Yes, your `v1` routes can use the functions you had in iteration 1, regardless of whether you rename the functions or not. The layer of abstraction in iteration 2 has changed from the function interface to the HTTP interface, and therefore your 'functions' from iteration 1 are essentially now just implementation details, and therefore are completely modifiable by you.

### 📡 4.9. User Sessions

#### The problem with Iteration 1 `controlUserId`

In iteration 1, a problem we have with the `controlUserId` is that there is no way to "log-out" a user - because all the user needs to identify themselves is just their user ID.

In iteration 2, we want to issue something that abstracts their user ID into the notion of a user session - this way a single user can log in, log out, or maybe log in from multiple places at the same time.

If you're not following the issue with the `controlUserId`, imagine it like trying to board a plane flight but your boarding pass IS your passport. Your passport is a (effectively) a permanent thing - it is just "always you". That wouldn't work, which is why airlines issue out boarding passes - to essentially grant you a "session" on a plane. And your boarding pass is linked to your passport. In this same way, a user session is associated with an `controlUserId`!

#### How we adapt in Iteration 2 - User Sessions

In iteration 2, instead of passing in `controlUserId` into functions, we will instead pass in a user session. Then on our server we look up the user session information (which we've stored) to:
* Identify if the user session is valid.
* Identify which control user this user session belongs to.

Then in this way, we can now allow for things like the ability to meaningfully log someone out, as well as to have multiple user sessions at the same time for multiple users, or even the same user (e.g. imagine being logged in on two computers but only wanting to log one out).

When we send this information, we typically use json form and send it in the **HTTP Request header**:
```json
{
  "controlUserSessionId" : "abcd1234"
}
```
A session is generally stringified for sending over HTTP - since everything over an HTTP request needs to be stringified. This is typically done with JSON. If you pass a JSONified object (as opposed to just a string or a number) as a session, we recommend that you use [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) and [decodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) to encode it to be friendly for transfer over URLs.

How you generate unique identifiers for control user sessions is up to you (we recommend using an existing library)

#### In summary

Implentation details are up to you, though the key things to ensure that you comply with are that:
* `controlUserSessionId` is an object that contains some information that identifies a unique user session.
* Your system allows **multiple** user sessions to be able to be logged in and logged out at the same time.

#### Other notes

### 📡 4.10. Error returning

Either a `400 (Bad Request)` or `401 (Unauthorized)` or `403 (Forbidden)` is thrown when something goes wrong. 
  - A `400` error refers to issues with user input; 
  - a `401` error refers to when someone does not attempt to authenticate properly;
  - a `403` error refers to issues with authorisation. 
  
Most of the routes in the API interface provided through types of these errors under various conditions.

To throw one of these errors, simply use the code `res.status(400).send(JSON.stringify({ error: 'specific error message here' }))` or `res.status(400).json({ error: 'specific error message here' })` in your server where 400 is the error.

Errors are thrown in the following order: 401, then 403, then 400.

#### 📡 4.10.1 HTTP Layer Seperation

Ideally you will not need to change the way you return errors from your logic functions that you wrote in Iteration 1.

Instead, your HTTP Layer should use helper function calls to handle 401 and 403 errors and rely on logic function calls to handle 400 errors.

Apart from these error checks, there should be **no logic in your HTTP Layer (server.ts) apart from calls to 401 and 403 error checking helper functions**.

What does this look like:

```javascript
// Endpoint :: GET /v1/admin/mission/{missionid}
// Matches iteration 1 logic - adminMissionInfo
app.get('/v1/admin/mission/:missionid', (req: Request, res: Response) => {
  // manage the missionid from params 
  const missionId = ...
  // manage user session from headers
  const controlUserSessionId = ...
  // check for correct user session using helperfunction getcontrolUserIdFromSession
  const controlUserId = getControlUserIdFromSession(controlUserSessionId);
  if (!controlUserId) {
    // can't find a correspoding user session for given control user sessionId
    return res.status(401).json({'error': 'Invalid session'});
  }

  // check to see if a missionId exists using checkMissionId helper function
  if (!checkMissionId(missionId)) {
    // space mission does not exist for given missionId
    return res.status(403).json({'error': 'Invalid MissionId'});
  }

  // check to see if the space mission owner is the same as the current control user session using the checkMissionOwner helper function
  if (!checkMissionOwner(controlUserId, missionId)) {
    return res.status(403).json({'error': 'Control User does not own this Space Mission'});
  }
  // call the logic layer function
  const result = adminMissionInfo(controlUserId, missionId);
  // if there is an error, return it with 400 status code
  if ('error' in result) {
    return res.status(400).json(result);
  }
  
  // no errors, normal return managed by logic function
  return res.json(result);
});
```
### 📡 4.11. Context Information

When carrying out Requirements Engineering tasks, it is important to be aware of the context of your project.

This refers to the areas of knowledge that are specific to the domain of your project.

In our instance, that domain is the organisation and planning of a space mission control system.

#### 📡 4.11.1 Famous Space Missions

There have been many famous space missions in the previous century. You may find some of them here:
  - [15 Important Space Missions](https://www.discovermagazine.com/the-sciences/15-of-the-most-life-changing-spacecraft-and-missions-that-fueled-our)
  - [NASA - 60 Years of Spaceflight](https://www.nasa.gov/specials/60counting/spaceflight.html)

These systems often used very simple computer systems to plan and execute these very complex space missions. We will not go into the complexities, just distill a few common aspects from these missions for out project.

#### 📡 4.11.2 Our Distilled Facts about Space Missions

Just about every space mission is controlled by a central authority, such as a government organisation like NASA or a private company such as SpaceX. Each space mission is assigned a controller who will manage the launch and successful operation of that mission.

Looking at most space missions, they are primarily unmanned (no human crew). However, we will focus on the manned space missions. For simplicity, lets label the crew of these manned space missions as: Astronauts!

In order to get to space, it looks like you need some sort of space ship like a rocket, space shuttle or [some other method](https://www.spinlaunch.com/) to get your astronauts and their equipment into space. We can call this a launch vehicle and the astronauts and their equipment the payload.

Now our context entities we are concerned about for a space mission are:
  - The Space Mission Controller
  - The Space Mission Itself
  - The Launch Vehicle
  - The Payload (Astronauts and their equipment)

#### 📡 4.11.3 Who might be a stakeholder for Xecaps?

A stakeholder for a project is anyone who has an interest in the outcomes of the project.

Our system would be of interest to any of our context entities, plus the development team responsible for providing the system (that's you!).

### 📡 4.12. Recommended approach

Our recommendation with this iteration is that you start out trying to implement the new functions similarly to how you did in iteration 1.

1. Spend the first week organising, planning and transforming. Identify common functionality and build out a list of helper functions. Then organise the project into 4 sprints an set delivery dates for each sprint.
2. Write HTTP tests. These will fail as you have not yet implemented the feature.
  * ‼️‼️ HINT: To improve the marks you get and speed at which you get work done, consider trying to avoid re-writing your tests for iteration 2 and instead tweak your iteration 1 tests that they can be "used" by the HTTP server.
3. Implement the feature and write the Express route/endpoint for that feature too.
  * ‼️‼️ HINT: make sure GET and DELETE requests utilise query parameters, whereas POST and PUT requests utilise JSONified bodies.
4. Run the tests and continue following 4.3. as necessary.

**Please note, when you have a single route (e.g. `/my/route/name`) alongside a wildcard route (e.g. `/my/route/{variable}`) you need to define the single route before the variable route.**

### 📡 4.13. Sprint Planning and Organisation

For this iteration, we expect you to do most of the organisation tasks introduced in Iteration 0 and Iteration 1 by yourselves.

**NOTE:: This section will be assessed earlier than the rest of Iteration 2. It will be due Wed 9am, Week 06 (18th June).**

#### 📡 4.13.1. Sprint Organisation tasks

You will be expected to go through Iteration 2 and do the following:
1. Identify data model updates by doing a Data Model Walkthrough for the HTTP Routes for Iteration 2
2. Identify Blocker and Helper/Common functions by doing an Organisation Walkthrough for Iteration 2
3. Build a dependancy graph for all your functions
4. Split all your tasks into Tiers to complete the least dependant items in earlier sprints and most dependant items in later sprints
5. Split those tasks amongst 4 sprints: one organisation and set-up sprint followed by three coding/testing sprints - Use the Sprint Template in your Wiki to document what happens in each Sprint. We should see 4 seperate Sprint Organisation entries
3. Carry out any updates recommended by your tutors/lab demonstrators to your iteration 1 functions
4. Switch all your logic and test files from .js to .ts
5. Merge Iteration 2 release into your default branch
6. Write HTTP Layer Endpoint stubs into server.ts
7. Write Logic Layer stubs into src/*.ts where * is the appropriate file

#### 📡 4.13.2. Sprint Leader

This Iteration we are giving each person an opportunity to act as a leader. No-one can be the leader twice during the same Iteration.

Each sprint you will designate a sprint leader. The leader will have the following responsibilities:
1. Running Meetings by preparing an Agenda prior to each meeting.
2. Recording Meeting Minutes on the Wiki
3. Asking team questions from their Project Manager (Your designated Tutor / Lab demonstrator)
4. Preparing a hand-off for the next Sprint Leader at the end of the week:
    1. A wiki entry titled "Iteration 2 - Sprint 1 or 2 or 3 or 4 - Hand-off" with the following:
        1. Which of the designated tasks were done
        2. Which (if any) are still pending
        3. Any recommendations for the next sprint

### 📡 4.14. Git Commit Message Guidelines

In order to give greater clarity during code reviews, we are asking everyone to adhere to a git commit message guideline.

This is to make your organisation more readable and to enforce atomic git practice (i.e. try to do only one type of change on one file per commit).

We will mostly follow the guidelines outlined in Conventional Commits specification found here: [https://www.conventionalcommits.org/en/v1.0.0/#specification](https://www.conventionalcommits.org/en/v1.0.0/#specification).

This [Medium post](https://medium.com/neudesic-innovation/conventional-commits-a-better-way-78d6785c2e08) is also very useful.

In addition, we will add some other common practices as well.

#### 📡 4.14.1. Conventional Commits

This guideline mostly looks to standardize commit messages by following this simple structure:
```
    <type>[(optional <scope>)]: <description>
    <empty line>
    [optional <body>]
    <empty line>
    [optional <footer(s)>] 
```
Let us describe the above structure:
1. `<type>`: The reason the change to the code base was made. Typical reasons could be:
    1. feat    : Adding a new feature
    2. fix     : Updating/fixing an existing feature that had a bug
    3. docs    : Adding/Changing Documentation
    4. refactor: Cleaning up or refactoring code
    5. test    : Adding/Changing tests
    6. style   : Updating code style
    7. ci      : Continuous Integration related task
    8. chore   : Non-feature related or multi feature related technical or prevantive maintenance
    9. other types can be found on the Conventional Commits website
2. `optional` : This means you do not need to add this section
3. `<scope>` : The broad area that is affected by this change. e.g. `feat(data)` would indicate a change to the data layer or `feat(http)` would indicate a change to the http layer.
4. `<description>`: A short heading describing what you have done this commit. Usually less than 52 characters.
5. `<empty line>`: An empty line to seperate sections of the commit message.
6. `<body>`: Additional details and descriptions about what the changes were this commit.
7. `<footer>`: A tag of the Issues (identified using `#`) or Merge Requests (identified using `!`) this commit is related to. E.g. #15,#17 or #18,!12 etc.

Our expectation is that you try to add the optional sections whenever possible.

####  📡 4.14.2. Example commit messages

You can see some example commit messages from the commit history when you merge Iteration 2 into default branch. Here are some other examples:
1. Updated data layer to have persistence:
    ```
    feat(data): Added persistence to data layer
    
    Added save() and load() functions to be called by setData() and getData() respectively

    #74
    ```
2. Added test for GET /v1/admin/Mission/{missionId}:
    ```
    test(http): Added error test cases for adminMissionInfo

    Test case for 401 error
    
    #82
    ```
3. After testing, fixed a bug in adminMissionInfo:
    ```
    fix: incorrect call on getControlUserIdFromSession in AMI

    getControlUserIdFromSession expected a string input, AMI tried sending a number

    !103
    ```
4. Removed an extra newline/cleaned up some code spacing issues in AMI:
    ```
    style: cleaned up AMI
    ```



### 📡 4.15. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>35%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
      <li>Correctly written tests based on the specification requirements.</li>
      <li>Correctly linted code.</li>
    </ul>
    Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Sprint Planning</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Proper breakdown of Iteration 2 into <b>four week-long sprints</b> for organisation</li>
        <li>Identify breaking and helper functions</li>
        <li>Allocate tasks into sprints with <b>strict</b> deadlines inside each sprint</li>
      </ul>
      <b>Note :: This part is due Wed 9am, Week 06 (18th June)</b>
    </td>
  </tr>
  <tr>
    <td>Sofware Development Life Cycle (Requirements)</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Stakeholder identification</li>
        <li>General Requirements identification from specication documents</li>
        <li>General questionnaire</li>
        <li>At least 3 user stories identified from questionnaire along with User acceptance criteria</li>
        <li>One user story developed into a Use Case with both Diagramatic and Written representation</li>
      </ul>
      <b>Note :: This is something the whole group should discuss, it is not a substitute for coding!!</b>
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      <ul>
        <li>Good test <b>coverage</b> - how well you cover the use cases (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.).</li>
        <li>Appropriate style as described in section 7.4.</li>
        <li>Appropriate application of good software design practices.</li>
        <li>Implementation of persistent state.</li>
        <li>Demonstrated successful connection of the supplied frontend to the backend code required for iteration 2 (doesn't have to be perfect).</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>20%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>For particular features, committing the bulk of your tests prior to your implementation.</li>
        <li>Most of your git commit messages are meaningful, clear, and informative and follow the standard set out by Conventional Commits in [4.14](#-414-git-commit-message-guidelines) and tutorial 05</li>
        <li>You contribute at least 1 meaningful merge requests PER WEEK (approved by a team member) that merges your branch code to default branch.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check ins every week.</li>
        <li>Effective use of course-provided MS Teams for effective communication with your group.</li>
        <li>Use of issue board on Gitlab OR another equivalent tool that is used to effectively track your tasks.</li>
        <li>Attendance and contributions at your teams standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
      </ul>
    </td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 7 below.

The formula used for automarking in this iteration is:

`Automark = 95*(t * i) + 5*e`
(Mark equals 95% of `t` multiplied by `i` plus 5% of `e`). This formula produces a value between 0 and 1.

Where:
 * `t` is the mark between 0-1 you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark between 0-1 you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).
 * `e` is the score between 0-1 achieved by running eslint against your code with the provided configuration. You may find a mark of 0 if you have used eslint disable comments in your code.


### 📡 4.16. Submission & Peer Assessment

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **peer assessment**.


## 🛸 5. Iteration 3: Completing the Lifecycle

Coming Soon


## 🌸 6. Due Dates and Weightings

| Iteration | Due date                            | Demonstration to tutor(s)      | Assessment weighting (%) |
| --------- | ----------------------------------- | ------------------------------ | ------------------------ |
| 0         | 9am Mon 26th May (**week  3**)  | No demonstration               | 10% of Project Stage 1 ( 3% overall)  |
| 1         | 9am Friday 6th June (**week  4**)  | In YOUR **week  5** tutorial or lab | 90% of Project Stage 1 mark (27% overall)  |
| 2         | 9am Friday 4th July (**week  8**)  | In YOUR **week  9** tutorial or lab | 100% of Project Stage 2 mark (30% overall)  |
| 3         | 9am Wednesday 30th July (**week 12**)  | In YOUR **week 12** tutorial | 100% of Project Stage 3 mark (30% overall)  |

### 🌸 6.1. Submission & Late Penalties

To submit your work, simply have your default (`master` or `main`) branch on the gitlab website contain your groups most recent copy of your code. I.E. "Pushing to default (`master` or `main`)" is equivalent to submitting. When marking, we take the most recent submission on your default (`master` or `main`) branch that is prior to the specified deadline for each iteration.

The following late penalties apply depending on the iteration:
 * Iteration 0: No late submissions at all
 * Iteration 1: Can submit up to 5 days late, with 5% penalty applied every time a 24 hour window passes, starting from the due date 
 * Iteration 2: Can submit up to 5 days late, with 5% penalty applied every time a 24 hour window passes, starting from the due date 
 * Iteration 3: Can submit up to 5 days late, with 5% penalty applied every time a 24 hour window passes, starting from the due date 

We will not mark commits pushed to default (`master` or `main`) branch after the final submission time for a given iteration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some rare cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but the default branch (`master` or `main`) should only contain working code.

Minor isolated fixes after the due date are allowed but may carry a penalty to the automark. If the isolated fixes result in a higher automark result (minus the penalty), then we will update your mark. E.g. imagine that your initial automark is 20%, on re-run you get a raw automark of 86%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 86% to 60%, your final **automark** will be 60%.

If the re-run automark after penalty is lower than your initial mark, we will keep your initial mark. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final **automark** will still be 50% (i.e. your initial mark).Minor isolated fixes after the due date are allowed but carry a penalty to the automark, if the automark after re-running the autotests is greater than your initial automark. This penalty can be up to 30% of the automarking component for that iteration, depending on the number and nature of your fixes. Note that if the re-run automark after penalty is lower than your initial mark, we will keep your initial mark, meaning your automark cannot decrease after a re-run. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final automark will still be 50% (i.e. your initial mark).

### 🌸 6.2. Demonstration

The demonstrations in weeks 5,9 and 12 will take place during your tutorial or lab sessions. All team members **must** attend these demonstrations. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15-20 minute Question and Answer session in front of your tutor. Each team member will be asked to explain their code.

## 👌 7. Individual Contribution

The marks given to you for each iteration are given to you individually. We do however use group marks (e.g. automarking) to infer this, and in many cases, you may receive the same mark as your group members, particularly in cases with well functioning groups. Your individual mark is determined by a combination of the factors below by your tutor, with your group mark as a reference point.Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Peer assessment

### 👌 7.1. Project check-in

During your lab class, you and your team will conduct a short standup in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
| Iteration | Week/Check-in | Expected progress                                                                                                                                     |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Week 2**    | Twice-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |
| 1         | **Week 3**    | Iteration 1 specification has been discussed in a meeting, broken down in Sprint 1 and Sprint 2 as per tutorial. At least 1 task (including tests if applicable) for Sprint 1 complete and plan to finish all Sprint 1 tasks |
| 1         | **Week 4**    | All Sprint 1 tasks complete, All tests complete, At least 1 Sprint 2 function complete per person |
| 2         | **Week 5**    | Iteration 2 specification has been discussed in a meeting, Overall Sprint planning targets have been completed|
| 2         | **Week 6**    | **Two checkins per week - a remote checkin on Monday/Tuesday, an in-person checkin on Friday** HTTP Tests complete for all server functions and HTTP function stubs complete plus helper functions logic has been completed |
| 2         | **Week 7**    | **There will be two remote checkins during week 7** Server routes complete and all blocker function tests and logic complete |
| 2         | **Week 8**    | **Two checkins per week - a remote checkin on Monday/Tuesday, an in-person checkin on Friday** All tests and logic for remaining functions complete |
| 3 | **Week 9** | Iteration 3 specification has been discussed in a meeting, Sprint planning is complete, Iteration 2 fixes are done |
| 3         | **Week 10**    | Exceptions & tokens in HTTP headers added across the project, all HTTP Tests and HTTP function stubs are in master. All helper and blocking function logic is completed.
| 3         | **Week 11**    | All tests and logic for remaining functions complete |
| 3         | **Week 12** | Project Exhibition in Thursday Lecture time, Project Demonstration on Wednesday and Friday |

### 👌 7.2. Tutorial contributions

From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials.
* Participate in tutorials by asking questions and offering answers.
* Attend all your project check-ins.

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 👌 7.3. Code contribution

All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

Please also note that **failure to commit (as an individual) at least once in each week of your iteration may result in up to a 20% mark penalty**. It's critical that you at least demonstrate you can make minor progress each week. If this were an individual assignment we would not enforce this, but given it is a group assignment it's important we encourage you to commit regularly.

### 👌 7.4. Documentation contribution

All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 👌 7.5. Peer Assessment

**Please note: Failure to complete a peer review for a particular iteration may result in a mark penalty of 10% for the iteration**

At the end of each iteration, there will be a peer assessment survey where you will rate and leave comments about each team member's contribution to the project up until that point. 

Your other team members will **not** be able to see how you rated them or what comments you left in either peer assessment. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down (after review by your tutor).

The following criteria will be assessed by your team members:
* **Participation**: What was the level of participation in group work, attendance at meetings, making suggestions, taking responsibility for tasks, being in communication with the team?
* **Dependability**: How dependable was this team member in delivering assigned tasks, on time, with expected levels of quality? 
* **Team Wellbeing**: How much did this team member contribute to the healthy functioning of the team by communicating with members, coordinating meetings, listening to concerns, facilitating discussion, offering suggestions?
* **Work contribution**: How much did this team member contribute to the development of the major project. .

<table>
  <tr>
    <th>Iteration</th>
    <th>Link</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td>[Peer Review Iteration 1](Link Sent to MS Teams)</td>
    <td>Fri 10am, 6th June</td>
    <td>Wed 9pm, 11th June</td>
  </tr>
  <tr>
    <td>2</td>
    <td>[Peer Review Iteration 2](Link Sent to MS Teams)</td>
    <td>Fri 10am, 4th July</td>
    <td>Tues 9am, 8th July</td>
  </tr>
  <tr>
    <td>3</td>
    <td>[Peer Review Iteration 3](Link Sent to MS Teams)</td>
    <td>Wed 10am, 30th Jul</td>
    <td>Mon 9am, 4th Aug</td>
  </tr>
</table>

### 👌 7.6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS Teams. Make sure you have:
1. Been clear about the issue you feel exists.
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved.
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 💻 8. Automarking & Previews

### 💻 8.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 120 second timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 120 seconds to run, you don't have to worry about it potentially taking longer when we run automarking.

#### 8.2 Preview Start times

 Note that you should not rely on this system like you would the auto-test system for 1091/1092. Instead, its purpose is to give you an idea of how you should organise your own tests.

Previews are run in the mid to late stages for each iteration. You may view the outcomes of your previews inside your MS Teams Channel.

We will run automarking Previews from the following dates until the due date of each iteration:
 - Iteration 1 :: June 2nd
 - Iteration 2 :: June 23rd
 - Iteration 2 :: July 21st

## 👀 9. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of DPST1093. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.

