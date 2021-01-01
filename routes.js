

function func(){
    console.log('hello');

}
function funcB(){
    console.log('world');
}

module.exports = func;

module.exports = {
    a:func,
    b: funcB
};

exports.func = func;
exports.someText = 'Some Text';