const { gql } = require('./graphql')
const { sendEmail } = require('./nodemailer')

module.exports = async (req, res) => {
  return res.status(200).send('<h1>Happy Birthday!</h1>')

  const data = await gql(`
    query allGuesses  {
      guess (order_by: {arrival: asc}) {
        id
        height
        arrival
        ounces
        pounds
        relation {
          description
          name
          id
        }
        user {
          name
          email
          id
        }
      }
    }
  `).catch(err => err instanceof Error ? err : new Error(JSON.stringify(err)))
  
  if (data instanceof Error) {
    return res.status(500).json({ message: 'error fetching guess data' })
  }
  
  if (data && data.guess && data.guess.length) {
    const result = await Promise.all(data.guess.map(async guess => {
      if (!guess.user || !guess.user.email) {
        return true
      }
      
      await sleep(5000)

      return sendEmail({
        to: guess.user.email,
        subject: 'Olivia Rae is here!',
        html: '<h1>Olivia Rae Jones</h1><p>8lbs. 2oz., 18.75in., born on 9/17 at 7:18PM!</p><p>See how your prediction held up at https://baby-olivia.now.sh!</p>'
      })
    }))
    
    res.status(200).json({ result })
  }
  
  res.status(500).json({ message: 'something amiss...' })
}

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}