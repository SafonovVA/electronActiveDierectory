const configz = {
    url: 'ldaps://hq.bc:636',
    baseDN: 'dc=hq,dc=bc',
    pass: '2452563775Bb1',
    user: 'safonov_46441@hq.bc',
    //url: 'ldaps://10.100.19.51:636',
    //baseDN: 'OU=LDTEST,DC=hq,DC=bc',
    //user: 'ldsd_crt_acc@hq.bc',
    //pass: 'Qwerty!23',
    tlsOptions: {
        //key: fs.readFileSync('./private.key'),
        //cert: fs.readFileSync('./cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        //ca: [
        //    fs.readFileSync('./cert.crt')
        //],
    }
};

const ad = new (require('ad'))(configz);

ad.user('safonov_46441').get()
    .then(user => console.log(JSON.stringify(user, null, 4)))
    .catch(err => console.log(JSON.stringify(err, null, 4)));