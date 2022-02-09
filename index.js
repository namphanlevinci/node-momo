
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const NodeRSA = require('node-rsa');

// using your public key get from https://business.momo.vn/

const pubKey = '-----BEGIN PUBLIC KEY-----' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkM60byyAOOGILAHxLtSd/DYNpLpUnE+G5/t5vRtFF4bqca0EK/TnEZ25dv4alm0WufnAGHY5s3K2xgaG2pbtDRkg1g7xF9POx74WDhNhwSi00rwSxh9CaJhrGzkK2Y0kLhTovYC43QmeU6/OaCJaifaZuqmHTgCTwjHFl3u5GF0ASI69ttkzekKkU5BGFG46a4f3VfVC5iZ6yJ/o0NEr4RErFYNND7+d7zxvbue2AdchCJ5jWo6uJIcN2Zox5xQR1ht8cUQ+AMz9ztBmehtk3JsrOtMyX6A63lSnigxtCVZ2I205rvJKheCXi2WI6Y4d0e3jUwEbG2fM83lchhz/pVSCXDwQdtU+C+zTP/3MIQEi8TuoVFRR1xtrkkvO95OZlF06qWwjby/yzBxpwF6PDQT57Ynicn+EA/2NcqjczmMB+OlozWJqZDg2JjTUfG8j0ivo5E+Uw3rGZh9wRlCXBqRatO+DbLBEsEONPs9YJX8KTxyHvERxsiTo4iW0E0GUHPsnHvCrqlWInIudxxDmm0Jdq1d9A17S0Kf2ywqmgNzB8r95/Nl64YiMf0CyAs730VHWEOG+zW//a0NMzwb1uy6eoVqNBV9De6aS0XhQsCHnPkthl//nDkEg9Nd6eC5kzLtpnd46BmcJy3Y+0lZ8CSNj19iTxY/mZwZynP2TFB8CAwEAAQ==' +
    '-----END PUBLIC KEY-----';


app.get('/', (req, res) => {
    res.send('');
});

app.post('/momoPayment', async function (req, res) {
    const body = req.body;
    const { partnerCode, partnerRefId, amount, customerNumber, appData, description } = body;
    const hash = await ecryptRSA(
        partnerCode, partnerRefId, amount
    )

    const responseMomoPayment = await sendPaymentReauestToMomoServer(customerNumber, partnerCode, partnerRefId, appData, hash, description);
    if (responseMomoPayment.status == 200) {
        if (responseMomoPayment.data.status == 0) {
            return res.status(200).send({ status: 200, message: "Payment success" });
        }
    } 
    return res.status(400).send({status: 400, message: "Payment error"});
});


async function sendPaymentReauestToMomoServer(customerNumber, partnerCode, partnerRefId, appData, hash, description) {

    const momoPaymentUrl = `https://test-payment.momo.vn/pay/app`;
    const data = {
        customerNumber,
        partnerCode,
        partnerRefId,
        appData,
        hash,
        description,
        version: 2.0,
    }
    let response;
    try {
        response = await axios.post(momoPaymentUrl, data);
    } catch (err) {
        console.log('Loi payment : ', { err })
    }

    return response;
}

async function ecryptRSA(partnerCode, partnerRefId, amount) {

    const key = new NodeRSA(pubKey, { encryptionScheme: 'pkcs1' });
    const jsonData = {
        "partnerCode": partnerCode,
        "partnerRefId": partnerRefId,
        "amount": amount,
    };
    const encrypted = await key.encrypt(JSON.stringify(jsonData), 'base64');
    return encrypted;
}


const server = app.listen(3001, () => {
    console.log('server running on prt 3001');
});