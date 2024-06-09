import { StatusCodes } from 'http-status-codes';
import GenericError from '../error/GenericError.js';

import UsuarioRepo from '../repository/UsuarioRepo.js';
import UsuarioEntity from '../entity/UsuarioEntity.js';
import GrupoController from './GrupoController.js';
import TipoOperacaoEnum from '../enum/TipoOperacaoEnum.js';

class UsuarioController {
  static async validarNovoUsuario(novoUsuario) {
    if (!novoUsuario) {
      throw new GenericError('corpo da requisicao nao possui usuario', { status: StatusCodes.BAD_REQUEST });
    }
    if (!novoUsuario.nome) {
      throw new GenericError('usuario nao possui nome', { status: StatusCodes.BAD_REQUEST });
    }
    if (!novoUsuario.senha) {
      throw new GenericError('usuario nao possui senha', { status: StatusCodes.BAD_REQUEST });
    }

    const usuarioExiste = await UsuarioRepo.findOne({ where: { nome: novoUsuario.nome } });

    if (usuarioExiste) {
      throw new GenericError('nome ja em uso', { status: StatusCodes.CONFLICT });
    }

    if (novoUsuario.grupo_id) {
      // validar se tem foi passado grupo, validar se o grupo existe

      throw new GenericError('grupo nao existe ', { status: StatusCodes.NOT_FOUND });
    }
  }

  async hasAccess(tipoOperacao, modulo, usuario) {
    try {
      const permissoes = await GrupoController.hasAccess(
        tipoOperacao,
        modulo,
        usuario.grupo_id,
      );
      return permissoes;
    } catch (error) {
      throw new GenericError(
        error.message,
        { status: error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  }

  static isRequestOther(usuarioRequest, usuarioGet) {
    console.log('isRequestOther?', usuarioRequest !== usuarioGet);
    return usuarioRequest !== usuarioGet;
  }

  static onlyHasAccessToSelf(permissoes) {
    const retorno = (permissoes.length === 1
      && !!permissoes.find((permissao) => [TipoOperacaoEnum.RETRIEVESELF, TipoOperacaoEnum.UPDATESELF, TipoOperacaoEnum.DELETESELF].includes(permissao.tipoOperacao)));

    console.log('onlyHasAccessToSelf?', retorno);
    return retorno;
  }

  async store(req, res) {
    try {
      const { usuario } = req.body;

      await UsuarioController.validarNovoUsuario(usuario);

      const usuarioSave = UsuarioEntity.parse(usuario);

      const novoUsuario = await UsuarioRepo.create(usuarioSave);

      const retjson = {
        novoUsuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
        },
        paths: {
          login: '/login',
        },
      };

      return res.status(StatusCodes.CREATED).json(retjson);
    } catch (error) {
      const status = error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

      return res.status(status).json({
        error: {
          message: error.message,
          ...error,
        },
        paths: {
          home: '/',
        },
      });
    }
  }

  async show(req, res) {
    try {
      const { usuarioId } = req.params;

      if (!usuarioId) {
        throw new GenericError('request sem usuarioId', { status: StatusCodes.BAD_REQUEST });
      }

      console.log(req.permissoes);

      if (
        UsuarioController.isRequestOther(req.usuario.id, usuarioId)
        && UsuarioController.onlyHasAccessToSelf(req.permissoes)
      ) {
        throw new GenericError('sem permissao', { status: StatusCodes.UNAUTHORIZED });
      }

      const usuario = UsuarioEntity.fromModel(await UsuarioRepo.findByPk(usuarioId));

      const retjson = {
        usuario,
        paths: {
          home: '/',
        },
      };

      return res.status(StatusCodes.OK).json(retjson);
    } catch (error) {
      const status = error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
      const retjson = {
        error: {
          message: error.message,
          ...error,
        },
        paths: {
          home: '/',
        },
      };
      return res.status(status).json(retjson);
    }
  }

  async index(req, res) {
    try {
      const usuarios = await UsuarioRepo.findAll();

      return res.status(StatusCodes.OK).json(usuarios);
    } catch (error) {
      const status = error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
      const retjson = {
        error: {
          message: error.message,
          ...error,
        },
        paths: {
          home: '/',
        },
      };
      return res.status(status).json(retjson);
    }
  }

  async delete(req, res) {
    try {
      const { usuarioId } = req.params;
      if (!usuarioId) {
        throw new GenericError('usuarioId nao enviado', { status: StatusCodes.BAD_REQUEST });
      }

      const usuario = await UsuarioRepo.delete(usuarioId);

      return res.status(StatusCodes.OK).json(usuario);
    } catch (error) {
      const status = error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
      const retjson = {
        error: {
          message: error.message,
          ...error,
        },
        paths: {
          home: '/',
        },
      };
      return res.status(status).json(retjson);
    }
  }

  async update(req, res) {
    try {
      const { usuarioId } = { ...req.params };
      if (!usuarioId) {
        throw new GenericError('usuarioId nao enviado', { status: StatusCodes.BAD_REQUEST });
      }

      const valuesUpdate = { ...req.body };
      if (!valuesUpdate) {
        throw new GenericError('body vazio', { status: StatusCodes.BAD_REQUEST });
      }

      if (
        UsuarioController.isRequestOther(req.usuario.id, usuarioId)
        && UsuarioController.onlyHasAccessToSelf(req.permissoes)
      ) {
        throw new GenericError('sem permissao', { status: StatusCodes.UNAUTHORIZED });
      }

      const camposUpdate = UsuarioEntity.parse(valuesUpdate);

      const usuarioUpdate = await UsuarioRepo.update(usuarioId, camposUpdate);

      return res.status(StatusCodes.OK).json(usuarioUpdate);
    } catch (error) {
      const status = error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;
      const retjson = {
        error: {
          message: error.message,
          ...error,
        },
        paths: {
          home: '/',
        },
      };
      return res.status(status).json(retjson);
    }
  }
}

export default new UsuarioController();
