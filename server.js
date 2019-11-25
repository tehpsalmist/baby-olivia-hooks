const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const { validateRequest } = require('./utilities')

const { gql } = require('./graphql')

const { sendEmail } = require('./nodemailer')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const rejected = validateRequest({
  tableName: 'user',
  operation: 'INSERT',
  dataKeys: ['new'],
  excludeAdminEvents: true,
  comparisonFunction: (old, fresh) => !fresh.special_words
})

app.post('/new-user', async (req, res) => {
  if (req.get('i-want-a') !== 'beebee') return res.status(400).json({ success: false })

  if (rejected(req)) {
    return res.status(200).json({ message: 'irrelevant trigger' })
  }
  
  const { special_words, id, name } = req.body.event.data.new
  
  const data = await gql(`
    query getUsersGuess {
      guess(where: {user_id: {_eq: ${id}}}) {
        arrival
        height
        id
        ounces
        pounds
        relation {
          description
          id
          name
        }
        timestamp
      }
    }
  `).catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
  
  if (data instanceof Error) {
    return res.status(500).json({ message: 'error fetching guess data' })
  }
  
  const prediction = data && data.guess && data.guess[0]
  
  if (!prediction) {
    return res.status(500).json({ message: 'no prediction found' })
  }
  
  const sent = await sendEmail({
    to: process.env.RECIPIENT,
    subject: `Special words from ${prediction.relation.name} ${name}`,
    html: `<p>${special_words}</p><br><p>--${prediction.relation.name} ${name}</p>`
  })
    .catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
  
  if (sent instanceof Error) {
    console.error(sent)
    return res.status(500).json({ message: 'error sending email' })
  }

  res.status(200).json({ success: true })
})

app.get('/send-results', require('./test-file'))

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})