# bankiru
get comments from Confluence RSS

## Getting Started
Install the module with: `npm install confluence-comments`

```javascript
const ConfluenceComments = require('confluence-comments')
const confluence = new ConfluenceComments('https://example.com/wiki/', {
  username: 'username', 
  password: 'password'
})

confluence.getComments('support', 10)
  .then(r => console.log(r))
  .catch(e => console.log(e))

//returns
[
  {
    title: 'Support',
    link: 'https://example.com/wiki/pages/viewpage.action?pageId=1234567&focusedCommentId=123123#comment-123123',
    author: 'AUTHOR NAME',
    updated: 1602494430000,
    isReply: true,
    commentText: 'Test ok',
    space: 'support'
  },
  ...
]
```
