exports.home = function(req, res){
  res.render(__dirname + '/../../public/views/home.ejs')
};

exports.sunburst = function(req, res){
    res.render(__dirname + '/../../public/views/sunburst.ejs')
};