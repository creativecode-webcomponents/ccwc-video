exports.onHandleAST = function(ev) {
    // modify AST
    //console.log(ev.data.ast)
    console.log(ev.data.ast.leadingComments)
    var comments = ev.data.ast.comments;

};