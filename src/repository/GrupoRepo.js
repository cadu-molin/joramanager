import { StatusCodes } from 'http-status-codes';
import GenericError from '../error/GenericError.js';
import Grupo from '../model/Grupo.js';
import GrupoPermissao from '../model/GrupoPermissao.js';
import Permissao from '../model/Permissao.js';
import GrupoEntity from '../entity/GrupoEntity.js';

class GrupoRepo {
  async retrievePermissao(grupo) {
    try {
      const res = await GrupoPermissao.findAll({
        where: {
          grupo_id: grupo.id,
        },
      });

      const permissoes = res.map((permissao) => permissao.toJSON());

      const permissoesGrupo = await Promise.all(permissoes.map(async (permissao) => {
        const resPermissao = await Permissao.findByPk(permissao.PermissaoId);
        const permissaoDescr = resPermissao.toJSON();

        permissao.descricao = permissaoDescr.descricao;
        permissao.tipoOperacao = permissaoDescr.tipo_operacao;
        permissao.modulo = permissaoDescr.modulo;

        return permissao;
      }));

      grupo.permissoes = permissoesGrupo;
    } catch (error) {
      throw new GenericError(error.message, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }
  }

  async findByPk(grupoId, retrievePermissao = false) {
    let grupo;

    try {
      const res = await Grupo.findByPk(grupoId);
      if (!res) {
        return res;
      }
      grupo = GrupoEntity.fromModel(res.toJSON());
      if (retrievePermissao) await this.retrievePermissao(grupo);
    } catch (error) {
      throw new GenericError(
        error.message,
        { status: error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }

    return grupo;
  }

  async findOne(options) {
    try {
      const res = await Grupo.findOne(options);

      if (!res) {
        return res;
      }

      const grupo = res.toJSON();
      return grupo;
    } catch (error) {
      throw new GenericError(
        error.message,
        { status: error.status ? error.status : StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  }
}

export default new GrupoRepo();
