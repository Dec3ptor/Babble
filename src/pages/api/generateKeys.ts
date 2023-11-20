// // pages/api/generateKeys.js

// import crypto from 'crypto';

// export default function handler(req, res) {
//   if (req.method === 'GET') {
//     crypto.generateKeyPair('rsa', {
//       modulusLength: 2048,
//       publicKeyEncoding: { type: 'spki', format: 'pem' },
//       privateKeyEncoding: { type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase: 'your-secret-passphrase' }
//     }, (err, publicKey, privateKey) => {
//       if (err) {
//         res.status(500).json({ error: 'Error generating key pair' });
//         return;
//       }
//       res.status(200).json({ publicKey, privateKey });
//     });
//   } else {
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
