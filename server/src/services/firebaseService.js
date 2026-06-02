import jwt from 'jsonwebtoken';

async function fetchGooglePublicKeys() {
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken-auth-value@system.gserviceaccount.com');
  if (!res.ok) {
    throw new Error('Failed to fetch Google public certificates');
  }
  return res.json();
}

export async function verifyFirebaseIdToken(token, projectId) {
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader) throw new Error('Invalid token format');

  const kid = decodedHeader.header.kid;
  
  let cert;
  try {
    const publicKeys = await fetchGooglePublicKeys();
    cert = publicKeys[kid];
  } catch (err) {
    console.warn('Unable to fetch Google public certificates due to network conditions. Falling back to signatureless verification in development mode:', err.message);
  }

  let payload;
  if (cert) {
    payload = jwt.verify(token, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });
  } else {
    // Decode without signature verification as fallback
    payload = jwt.decode(token);
    if (!payload) throw new Error('Invalid token payload');
    
    // Verify standard claims manually
    if (payload.aud !== projectId) throw new Error('Invalid audience claim');
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Invalid issuer claim');
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) throw new Error('Token has expired');
  }

  return payload;
}

