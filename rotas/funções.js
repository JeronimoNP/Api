try{
    function validateEmail(email) {
        let re = /\S+@acad.ifma.edu.br+/;
        return re.test(email);
    }

    function createToken(dados){
        const token = jwt.sign(dados, "123456"   );
        return token;
    }
} catch {
    return console.log("Erro: no codigo na função")
}

module.export = {
    createToken,
    validateEmail
}