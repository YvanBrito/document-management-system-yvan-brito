# Especificação - Document Management System

> Especificação funcional e técnica para orientar o desenvolvimento do DMS.
> Este documento define o comportamento esperado, mas não executa nem altera a
> implementação do backend ou do frontend.

## 1. Objetivo

Disponibilizar um sistema web simples para que usuários enviem, consultem e
baixem documentos, mantendo os arquivos no filesystem local da aplicação e os
metadados em memória nesta fase inicial.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Gravação dos arquivos em `backend/storage` com `multer` e `diskStorage`.
- Registro em memória dos metadados de cada documento.
- Listagem dos documentos registrados.
- Download de um documento pelo seu identificador.
- Associação simples do documento a um usuário por meio do campo `owner`.
- Interface web para upload, listagem e download.
- Tratamento de erros nos limites HTTP e de filesystem.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Banco de dados ou persistência durável dos metadados.
- Versionamento, edição ou exclusão de documentos.
- Autenticação, autorização e cadastro completo de usuários.
- Compartilhamento de documentos entre usuários.
- Busca textual, categorização, etiquetas ou paginação.
- Pré-visualização e processamento do conteúdo dos arquivos.

## 3. Premissas e regras de negócio

- Cada upload contém exatamente um arquivo no campo multipart `file`.
- O documento recebe um identificador único gerado pela aplicação.
- O nome físico usado no armazenamento deve evitar colisões e não deve depender
  diretamente do nome informado pelo cliente.
- O nome original deve ser preservado nos metadados e no download.
- O dono é informado pelo campo textual `owner`; na ausência de autenticação,
  esse valor representa apenas uma associação simples.
- O upload só é considerado concluído quando o arquivo foi salvo e os metadados
  foram registrados.
- Reiniciar o processo apaga os metadados em memória. Os arquivos que já foram
  gravados permanecem no filesystem, mas não serão recuperados automaticamente
  nesta fase.
- A API não deve expor o caminho físico interno do arquivo.

## 4. Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento. | Uma requisição multipart válida cria o documento e retorna HTTP 201 com seus metadados. |
| RF-02 | O sistema valida a presença do arquivo. | Uma requisição sem o campo `file` retorna HTTP 400 e não cria metadados. |
| RF-03 | O sistema associa o documento a um dono. | O valor de `owner` recebido no upload é retornado nos metadados. |
| RF-04 | O sistema gera um identificador único. | Cada documento criado possui um `id` não vazio e diferente dos demais. |
| RF-05 | O sistema preserva o nome original. | `originalName` corresponde ao nome enviado e é usado no download. |
| RF-06 | O usuário pode listar os documentos. | A consulta retorna HTTP 200 e um array de metadados; sem documentos, retorna `[]`. |
| RF-07 | O usuário pode baixar um documento pelo identificador. | Um identificador existente retorna HTTP 200, conteúdo binário e cabeçalho de anexo com o nome original. |
| RF-08 | O sistema trata documentos inexistentes. | Um download com identificador desconhecido retorna HTTP 404. |
| RF-09 | A interface atualiza a listagem após um upload. | O documento criado aparece na lista sem exigir recarregamento manual da página. |
| RF-10 | A interface informa estados da operação. | Upload, carregamento, lista vazia e erros possuem retorno visual em português. |

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local com `multer.diskStorage`. |
| RNF-02 | O diretório padrão de upload deve ser `backend/storage`. |
| RNF-03 | Os metadados devem permanecer em memória nesta fase. |
| RNF-04 | A configuração variável, como porta e caminho de armazenamento, deve vir de variáveis de ambiente, seguindo 12-Factor App. |
| RNF-05 | O backend deve seguir o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-06 | As camadas internas não devem conhecer Express nem detalhes do protocolo HTTP. |
| RNF-07 | O backend deve usar Node.js, Express e CommonJS, sem TypeScript. |
| RNF-08 | O frontend deve usar React, Vite, componentes funcionais e Hooks. |
| RNF-09 | O frontend deve acessar o backend com `fetch` pelo prefixo `/api`. |
| RNF-10 | Mensagens apresentadas ao usuário devem estar em português. |
| RNF-11 | Erros de entrada, leitura e escrita devem ser tratados nos limites do sistema sem revelar caminhos internos. |
| RNF-12 | A solução deve priorizar simplicidade, legibilidade, SOLID, DRY, KISS e YAGNI. |

## 6. Modelo de dados

### 6.1 Metadados públicos do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único gerado pela aplicação. |
| `originalName` | string | Sim | Nome original do arquivo enviado. |
| `size` | number | Sim | Tamanho do arquivo em bytes, maior ou igual a zero. |
| `uploadedAt` | string | Sim | Data e hora do upload no formato ISO 8601 em UTC. |
| `owner` | string | Sim | Identificador textual do dono do documento. |

Exemplo:

```json
{
  "id": "7c95773e-9b12-48ad-a267-8b71ee2903f2",
  "originalName": "contrato.pdf",
  "size": 184320,
  "uploadedAt": "2026-09-23T14:30:00.000Z",
  "owner": "usuario-1"
}
```

### 6.2 Dados internos de armazenamento

O repositório pode manter junto aos metadados um nome físico ou caminho interno
necessário para localizar o arquivo. Esse dado não integra o contrato público e
não deve ser retornado pela API.

### 6.3 Ciclo de vida

- Os metadados são criados após o `multer` concluir a gravação do arquivo.
- O repositório em memória oferece operações de inclusão, listagem e busca por
  identificador.
- Não há atualização ou remoção nesta fase.
- Não há reconstrução automática dos metadados a partir de `backend/storage`.

## 7. Contratos de API

Durante o desenvolvimento, o frontend usa o prefixo `/api`, removido pelo proxy
do Vite antes de encaminhar a chamada ao backend. As rotas do backend são as
descritas abaixo.

### 7.1 Formato de erro

Respostas de erro em JSON seguem o formato:

```json
{
  "error": "Descrição do erro em português."
}
```

### 7.2 `POST /upload`

Envia e registra um documento.

**Entrada**

- `Content-Type`: `multipart/form-data`.
- Campo `file`: arquivo binário obrigatório.
- Campo `owner`: string obrigatória que identifica o dono.

Exemplo de requisição:

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@contrato.pdf" \
  -F "owner=usuario-1"
```

**Resposta de sucesso**

- Status: `201 Created`.
- Corpo: metadados públicos do documento criado.

```json
{
  "id": "7c95773e-9b12-48ad-a267-8b71ee2903f2",
  "originalName": "contrato.pdf",
  "size": 184320,
  "uploadedAt": "2026-09-23T14:30:00.000Z",
  "owner": "usuario-1"
}
```

**Erros previstos**

| Status | Condição |
| --- | --- |
| `400 Bad Request` | Arquivo ou dono ausente/inválido. |
| `500 Internal Server Error` | Falha inesperada ao gravar o arquivo ou registrar os metadados. |

### 7.3 `GET /documents`

Lista os metadados dos documentos registrados no processo atual.

**Entrada**

- Sem corpo e sem parâmetros obrigatórios.

**Resposta de sucesso**

- Status: `200 OK`.
- Corpo: array de metadados públicos, vazio quando não houver documentos.

```json
[
  {
    "id": "7c95773e-9b12-48ad-a267-8b71ee2903f2",
    "originalName": "contrato.pdf",
    "size": 184320,
    "uploadedAt": "2026-09-23T14:30:00.000Z",
    "owner": "usuario-1"
  }
]
```

**Erros previstos**

| Status | Condição |
| --- | --- |
| `500 Internal Server Error` | Falha inesperada ao consultar o repositório. |

### 7.4 `GET /documents/:id/download`

Baixa o conteúdo de um documento existente.

**Entrada**

- Parâmetro de rota `id`: identificador obrigatório do documento.

**Resposta de sucesso**

- Status: `200 OK`.
- Corpo: conteúdo binário do arquivo.
- `Content-Disposition`: anexo com o nome original.
- `Content-Type`: tipo detectado ou `application/octet-stream`.

**Erros previstos**

| Status | Condição |
| --- | --- |
| `404 Not Found` | Metadados ou arquivo físico não encontrado. |
| `500 Internal Server Error` | Falha inesperada ao ler ou transmitir o arquivo. |

## 8. Decisões arquiteturais

### 8.1 Backend

O backend adota uma Clean Architecture simples, sem abstrações adicionais além
das necessárias para separar responsabilidades:

- `routes/`: declara endpoints, configura o middleware de upload e delega aos
  controllers.
- `controllers/`: traduz requisições e respostas HTTP, realiza validações de
  entrada simples e encaminha erros.
- `services/`: aplica regras de negócio, cria os metadados e coordena os casos
  de uso de upload, listagem e download.
- `repositories/`: mantém os metadados em memória e fornece acesso aos dados.

O fluxo de dependência é `routes -> controllers -> services -> repositories`.
Serviços e repositórios não dependem de Express.

### 8.2 Armazenamento

- `multer.diskStorage` grava diretamente em `backend/storage`.
- O diretório pode ser configurado por variável de ambiente para permitir
  isolamento em testes, mantendo o valor padrão exigido para execução normal.
- O nome físico deve ser único e pode preservar a extensão original.
- Não serão utilizados provedores externos, serviços de upload ou banco de
  dados.

### 8.3 Frontend

- Componentes funcionais separam formulário de upload, lista e ação de download.
- Um módulo em `services/` centraliza chamadas `fetch` para evitar duplicação.
- A interface consome `/api`, deixando o proxy do Vite encaminhar ao backend.
- Estado de documentos, carregamento e erros fica na página responsável pela
  composição dos componentes.

## 9. Plano de execução

As etapas abaixo descrevem a ordem futura de implementação. Nesta fase, nenhum
arquivo do backend ou frontend deve ser criado ou alterado.

1. **Preparar critérios e testes do backend**
   - Derivar cenários de sucesso e erro dos contratos desta especificação.
   - Preparar isolamento do diretório de upload durante os testes.
   - Cobrir upload, listagem, download e recurso inexistente com `node:test`.

2. **Construir a persistência em memória**
   - Definir o repositório de documentos com inclusão, listagem e busca por ID.
   - Manter detalhes físicos internos fora das respostas públicas.

3. **Implementar regras de negócio**
   - Gerar identificadores e datas.
   - Validar arquivo e dono.
   - Coordenar criação, listagem e localização dos documentos.

4. **Implementar controllers e tratamento de erros**
   - Traduzir entradas HTTP para os casos de uso.
   - Padronizar status e mensagens de erro.
   - Transmitir downloads sem expor caminhos internos.

5. **Configurar rotas e armazenamento local**
   - Configurar `multer.diskStorage` para `backend/storage`.
   - Registrar `POST /upload`, `GET /documents` e
     `GET /documents/:id/download`.
   - Integrar as dependências no ponto de entrada do Express.

6. **Validar o backend**
   - Executar os testes automatizados.
   - Confirmar que arquivos de teste são removidos e que erros não deixam
     metadados inconsistentes.

7. **Implementar o cliente de API do frontend**
   - Centralizar upload, listagem e URL de download via `/api`.
   - Converter respostas de erro em mensagens apropriadas para a interface.

8. **Implementar os componentes do frontend**
   - Criar formulário de upload, lista de documentos e ação de download.
   - Incluir estados de carregamento, envio, vazio e erro.
   - Atualizar a lista após upload concluído.

9. **Integrar e validar a aplicação**
   - Executar testes do backend e build do frontend.
   - Verificar manualmente upload, listagem e download via proxy do Vite.
   - Confirmar comportamento responsivo e mensagens em português.

## 10. Critérios de conclusão

- Todos os requisitos funcionais possuem cobertura automatizada ou cenário de
  validação manual definido.
- Os três endpoints respeitam os contratos documentados.
- Arquivos são armazenados apenas no filesystem local com `multer.diskStorage`.
- Metadados permanecem em memória e não expõem caminhos internos.
- O backend respeita as quatro camadas e o sentido das dependências.
- O frontend consome somente o prefixo `/api` e apresenta os estados esperados.
- Testes do backend e build do frontend são concluídos sem erros.