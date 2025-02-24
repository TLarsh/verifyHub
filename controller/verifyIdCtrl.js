// import axios from 'axios';

// const options = {
//   method: 'POST',
//   url: 'https://api.qoreid.com/v1/ng/identities/nin-phone/phoneNumber',
//   headers: {accept: 'application/json', 'content-type': 'application/json'},
//   data: {
//     firstname: 'John',
//     lastname: 'Smith',
//     dob: 'string',
//     phone: 'string',
//     email: 'string',
//     gender: 'string'
//   }
// };

// axios
//   .request(options)
//   .then(res => console.log(res.data))
//   .catch(err => console.error(err));


//   const QOREID_API_URL = "https://api.qoreid.com/v1/ng/identities/nin-phone/phoneNumber";
//   const QOREID_API_KEY = process.env.QOREID_API_KEY; // Store API key in .env
  
//   app.post("/verify-nin", async (req, res) => {
//     try {
//       const { firstname, lastname, dob, phone, email, gender } = req.body;
  
//       if (!firstname || !lastname || !dob || !phone || !email || !gender) {
//         return res.status(400).json({ error: "All fields are required." });
//       }
  
//       const response = await axios.post(
//         QOREID_API_URL,
//         { firstname, lastname, dob, phone, email, gender },
//         { headers: { Authorization: `Bearer ${QOREID_API_KEY}` } }
//       );
  
//       res.json(response.data);
//     } catch (error) {
//       res.status(error.response?.status || 500).json({
//         error: error.response?.data || "Internal Server Error",
//       });
//     }
//   });