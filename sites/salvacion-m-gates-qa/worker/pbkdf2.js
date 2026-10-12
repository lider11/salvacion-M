// PBKDF2-HMAC-SHA-256 fallback for runtimes that cap native deriveBits.
// RFC 8018 F(P,S,c,1), 256-bit output. No split/concatenated derivations.
function pbkdf2Sha256Fallback(password,salt,iterations){
 if(!Number.isSafeInteger(iterations)||iterations<210000||iterations>600000)throw new Error('invalid_pbkdf2_cost');
 const K=Uint32Array.from([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
 const initial=Uint32Array.from([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]),w=new Uint32Array(64);
 const rotate=(n,b)=>(n>>>b)|(n<<(32-b));
 function compress(bytes,offset,state){
  for(let i=0;i<16;i++){const j=offset+i*4;w[i]=(bytes[j]<<24)|(bytes[j+1]<<16)|(bytes[j+2]<<8)|bytes[j+3]}
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(rotate(a,7)^rotate(a,18)^(a>>>3))+w[i-7]+(rotate(b,17)^rotate(b,19)^(b>>>10)))>>>0}
  let [a,b,c,d,e,f,g,h]=state;
  for(let i=0;i<64;i++){const t1=(h+(rotate(e,6)^rotate(e,11)^rotate(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((rotate(a,2)^rotate(a,13)^rotate(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}
  const out=[a,b,c,d,e,f,g,h];for(let i=0;i<8;i++)state[i]=(state[i]+out[i])>>>0;
 }
 function digest(message,prefix=initial,prefixLength=0){
  const padded=new Uint8Array(Math.ceil((message.length+9)/64)*64);padded.set(message);padded[message.length]=128;
  new DataView(padded.buffer).setUint32(padded.length-4,(prefixLength+message.length)*8,false);
  const state=new Uint32Array(prefix);for(let offset=0;offset<padded.length;offset+=64)compress(padded,offset,state);
  const result=new Uint8Array(32),view=new DataView(result.buffer);for(let i=0;i<8;i++)view.setUint32(i*4,state[i],false);return result;
 }
 let key=password.length>64?digest(password):password;
 const innerBlock=new Uint8Array(64).fill(0x36),outerBlock=new Uint8Array(64).fill(0x5c);
 for(let i=0;i<key.length;i++){innerBlock[i]^=key[i];outerBlock[i]^=key[i]}
 const innerState=new Uint32Array(initial),outerState=new Uint32Array(initial);compress(innerBlock,0,innerState);compress(outerBlock,0,outerState);
 const hmac=message=>digest(digest(message,innerState,64),outerState,64);
 const first=new Uint8Array(salt.length+4);first.set(salt);first[first.length-1]=1;
 let u=hmac(first);const result=new Uint8Array(u);
 for(let i=1;i<iterations;i++){u=hmac(u);for(let j=0;j<32;j++)result[j]^=u[j]}
 key=null;innerBlock.fill(0);outerBlock.fill(0);innerState.fill(0);outerState.fill(0);w.fill(0);u.fill(0);return result;
}
