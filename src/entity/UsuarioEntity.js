import bcryptjs from 'bcryptjs';

class UsuarioEntity {
  constructor(usuario) {
    if (usuario.id) this.id = usuario.id;
    this.nome = usuario.nome;

    if (usuario.senha) this.senha = usuario.senha;
    if (usuario.senha_hash) this.senha = usuario.senha_hash;
    if (usuario.grupo_id) this.grupo_id = usuario.grupo_id;
  }

  static parse(usuario) {
    const usuarioParse = { nome: usuario.nome, senha: usuario.senha, grupo_id: usuario.grupo_id };

    return new UsuarioEntity(usuarioParse);
  }

  static fromModel(usuarioModel) {
    const usuarioParse = {
      id: usuarioModel.id,
      nome: usuarioModel.nome,
      grupo_id: usuarioModel.grupo_id,
    };

    return new UsuarioEntity(usuarioParse);
  }

  static fromModelLogin(usuarioModel) {
    const usuarioParse = {
      id: usuarioModel.id,
      nome: usuarioModel.nome,
      grupo_id: usuarioModel.grupo_id,
      senha_hash: usuarioModel.senha_hash,
    };

    return new UsuarioEntity(usuarioParse);
  }

  async senhaIsValid(password) {
    return bcryptjs.compare(password, this.senha_hash);
  }
}

export default UsuarioEntity;
