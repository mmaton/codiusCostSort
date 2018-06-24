const request = require('request-promise');
const q = require('q');

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

const codiusHosts = [
  // 'https://codius.justmoon.com',
  'https://codius.ripple-ledger.com'
]

var getPeers = new Promise(function(resolve, reject) {
  request(codiusHosts.random() + '/peers', function(error, response, body) {
    let peers = JSON.parse(body);
    resolve(peers.peers);
  });
});

function listPeers(list) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    var peerArr = [];
    list.forEach(peer => {
      var promise = request(peer + '/info').then(response => {
        let costPerMonth = JSON.parse(response).costPerMonth;
        peerArr.push({'peer': peer, 'costPerMonth': costPerMonth})
      }).catch(error => {
        return null
      })
      promises.push(promise);
    })
    q.all(promises).then(test => {
      // Sort the peers by costPerMonth
      peerArr.sort(function(a, b){
        var costA = a.costPerMonth, costB = b.costPerMonth;
        if(costA < costB) return -1;
        if(costA > costB) return 1;
        return 0;
      });
      console.log(`Successful hosts scanned: ${peerArr.length}/${promises.length}`)
      resolve(peerArr);
    })
  })
}

getPeers.then(async peers => {
  peerList = await listPeers(peers)
  console.log(peerList)
})