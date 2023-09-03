const Express = require('express');
const app = Express();
require('dotenv').config();
const keyTokenServe = process.env.KEYSERVETOKEN;
//importando modelo de dados
const User = require('./models/Users');
//importando cors para que as requisições funcionem no navegador
const cors = require('cors')
//importando encriptografia de senha
const bcrypt = require('bcrypt');
const { error } = require('qrcode-terminal');
//importanto criador de token
const jwt = require('jsonwebtoken');


const portahttp = 3000;

app.use(cors());
app.use(Express.json());

//get para o login de usuarios existentes ao banco de dados!
app.post('/login', async (req, res) => {
    const {email, senha} = req.body;

    try {
        const usuario = await User.findOne({where: {email}});
        
        if(!usuario){
            return res.status(404).json({
                erro: true,
                mensagem: "Conta não encontrada"
            });
            } else {
                const status = await bcrypt.compare(senha, usuario.senha);
                if(status){
                    const token = createToken(req.body);
                    return res.status(200).json({
                        erro: false,
                        token: token
                    });

                } else {
                    return res.status(401).json({
                        erro: true,
                        info: "Senha incorreta"
                    });
                }
                }
        } catch (error){
            console.error(error);
            return res.status(500).json({
                erro: true,
                info: "Erro interno do servidor!"
            });
        }
});


//post para cadastro de novos usuarios
app.post('/cadastro', async (req, res) => {
    const {email, senha, nome} = req.body;
    //encriptografando senha para salvar no banco de dados


    try{
        const senhacry = await bcrypt.hash(senha, 10);
        req.body.senha = senhacry;
    } catch {
        console.log('Erro ao encriptografa senha!!:', error);
        return res.status(500).json({
            erro: true,
            mensagem: "Erro ao encriptografa senha!!"
        });
    }

    //verificar se existe o mesmo email no banco de dados
    const dominiovalido = await validateEmail(email);
    if(dominiovalido === false){
        return res.status(401).json({
            erro: true,
            mensagem: "Email invalido, utilize o email academico"
        });
    }

    const emailExiste = await User.findOne({where:{email}});
    if(!emailExiste){
        //
        await User.create(req.body)
        .then(() => {
            return res.status(201).json({
                erro: false,
                mensagem: "Usuario cadastrado com sucesso!!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "ERRO ao cadastrar usuario!"
            });
        });
    } else {
        return res.status(406).json({
            erro: true,
            mensagem: "email ja existente no banco de dados!"
        });
    };
});


app.get('/listar', async (req, res) => {
    // const {email, senha} = req.body;
    let lista = await User.findAll();
    const users = lista.map((user)=>{
        return { ...user.dataValues, senha: undefined }
    });
    return res.status(200).json({ users: users })
    
});

app.delete('/deletar', async(req, res) => {
    const body = req.body;
    const dados1 = logintoken(body.token);
    console.log(dados1)
    if(dados1 === "Token Expirado"){
        return res.status(200).json({
                Erro: true,
                Info: "token Expirado"
            });
    }else{
        if(dados1 === ""){
            return res.status(200).json({
                Erro: true,
                Info: "token Invalido"
            }); 
        }
    }
    const email = dados1.email;

    const local = await User.findOne({where: {email}});
    
    if(!local ){
        return res.status(498).json({
            Erro: true,
            Info: "não foi possivel encontrar o email!"
        });
    } else{
    
        const info = await bcrypt.compare(dados1.senha, local.senha);
        if(info){
            User.destroy({
                where: {
                    id: local.id
                }
            });
            return res.status(200).json({
                Erro: false,
                Info: "Conta apagada!"
            })
        }
    }
});

app.post('/produto', async (req, res) =>{
    
});

try{
    function validateEmail(email) {
        let re = /\S+@acad.ifma.edu.br+/;
        return re.test(email);
    }

    function createToken(dados){
        const dados1 = {
            email: dados.email,
            senha: dados.senha,
        }
        const temp = { expiresIn: "5m" }
        console.log(dados1);
        const token = jwt.sign(dados1, keyTokenServe, temp);
        return token;
    }

    function logintoken(token1){
        try{
        const token2 = jwt.verify(token1, keyTokenServe);

        return token2;
        } catch(err){
            if(err.name === 'TokenExpiredError'){
                const info = "Token Expirado"
                return info
            }else{
                const info = "Token Expirado"
                return info
            }
        }

    }
} catch {
    return console.log("Erro: no codigo na função")
}

app.post('/token', async (req, res) =>{
    const info = logintoken(req.body.token)
    console.log(info)
    return res.status(200).json(info)
})

// iniciando porta http
app.listen(3000, () => {
    console.log("Servidor iniciado no endereço http://localhost:" + portahttp);
});