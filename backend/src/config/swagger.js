export default {
  openapi: '3.0.0',
  info: {
    title: 'Petshop API',
    description: 'API REST para sistema de gerenciamento de Petshop.',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor Local'
    }
  ],
  tags: [
    { name: 'Health', description: 'Status da API' },
    { name: 'Customers', description: 'Gerenciamento de clientes' },
    { name: 'Pets', description: 'Gerenciamento de pets e histórico' },
    { name: 'Categories', description: 'Categorias de produtos' },
    { name: 'Products', description: 'Gerenciamento de produtos' },
    { name: 'Price History', description: 'Histórico de preços' },
    { name: 'Stock', description: 'Controle de estoque e movimentações' },
    { name: 'Services', description: 'Gerenciamento de serviços' },
    { name: 'Employees', description: 'Funcionários e profissionais' },
    { name: 'Appointments', description: 'Agenda de atendimentos' },
    { name: 'Sales', description: 'Vendas e faturamento' },
    { name: 'Dashboard', description: 'Indicadores consolidados' },
    { name: 'Reports', description: 'Relatórios do sistema' }
  ],
  components: {
    parameters: {
      pageParam: {
        in: 'query',
        name: 'page',
        schema: {
          type: 'integer',
          default: 1
        },
        description: 'Número da página desejada'
      },
      limitParam: {
        in: 'query',
        name: 'limit',
        schema: {
          type: 'integer',
          default: 10
        },
        description: 'Quantidade máxima de registros por página'
      },
      idParam: {
        in: 'path',
        name: 'id',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'ID único do registro'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica saúde da API',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Lista clientes com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Busca por nome, CPF, telefone ou email'
          }
        ],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      },
      post: {
        tags: ['Customers'],
        summary: 'Cadastra um novo cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Busca cliente por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Customers'],
        summary: 'Atualiza dados do cliente',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Customers'],
        summary: 'Remove cliente (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/pets': {
      get: {
        tags: ['Pets'],
        summary: 'Lista pets com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      },
      post: {
        tags: ['Pets'],
        summary: 'Cadastra um novo pet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/pets/{id}': {
      get: {
        tags: ['Pets'],
        summary: 'Busca pet por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Pets'],
        summary: 'Atualiza dados do pet',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Pets'],
        summary: 'Remove pet (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/pets/{id}/history': {
      get: {
        tags: ['Pets'],
        summary: 'Lista histórico do pet com paginação',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      },
      post: {
        tags: ['Pets'],
        summary: 'Adiciona registro ao histórico do pet',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Registro criado com sucesso' }
        }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lista categorias com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Cadastra nova categoria',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Busca categoria por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Categories'],
        summary: 'Atualiza categoria',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Categories'],
        summary: 'Remove categoria (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Lista produtos com paginação e filtros',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Cadastra produto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Busca produto por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Atualiza produto',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Remove produto (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/products/{id}/price-history': {
      get: {
        tags: ['Products'],
        summary: 'Busca histórico de preços do produto',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/products/{id}/stock': {
      get: {
        tags: ['Products'],
        summary: 'Busca histórico de estoque do produto',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Adiciona movimentação de estoque',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Movimentação registrada' }
        }
      }
    },
    '/stock/movements': {
      get: {
        tags: ['Stock'],
        summary: 'Lista todas as movimentações de estoque globais',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/stock/products/{productId}/movement': {
      post: {
        tags: ['Stock'],
        summary: 'Registra movimentação via rota exclusiva de estoque',
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/price-history': {
      get: {
        tags: ['Price History'],
        summary: 'Lista histórico global de preços',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/price-history/products/{productId}': {
      get: {
        tags: ['Price History'],
        summary: 'Lista histórico de preços por produto (rota de histórico)',
        parameters: [
          {
            in: 'path',
            name: 'productId',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/services': {
      get: {
        tags: ['Services'],
        summary: 'Lista serviços com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      post: {
        tags: ['Services'],
        summary: 'Cadastra serviço',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/services/{id}': {
      get: {
        tags: ['Services'],
        summary: 'Busca serviço por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Services'],
        summary: 'Atualiza serviço',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Services'],
        summary: 'Remove serviço (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Lista funcionários com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      post: {
        tags: ['Employees'],
        summary: 'Cadastra funcionário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Busca funcionário por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      put: {
        tags: ['Employees'],
        summary: 'Atualiza funcionário',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Employees'],
        summary: 'Remove funcionário (Soft Delete)',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Removido com sucesso' }
        }
      }
    },
    '/employees/{id}/appointments': {
      get: {
        tags: ['Employees'],
        summary: 'Busca agendamentos do funcionário com paginação',
        parameters: [
          { $ref: '#/components/parameters/idParam' },
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'Lista agendamentos',
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      post: {
        tags: ['Appointments'],
        summary: 'Cria agendamento com validação de conflito',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/appointments/{id}': {
      put: {
        tags: ['Appointments'],
        summary: 'Atualiza status e observações do agendamento',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          200: { description: 'Atualizado com sucesso' }
        }
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Cancela agendamento',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          204: { description: 'Cancelado com sucesso' }
        }
      }
    },
    '/sales': {
      get: {
        tags: ['Sales'],
        summary: 'Lista vendas com paginação',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/limitParam' }
        ],
        responses: {
          200: { description: 'Sucesso' }
        }
      },
      post: {
        tags: ['Sales'],
        summary: 'Registra nova venda abatendo estoque',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        },
        responses: {
          201: { description: 'Criado com sucesso' }
        }
      }
    },
    '/sales/{id}': {
      get: {
        tags: ['Sales'],
        summary: 'Busca venda por ID',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/sales/{id}/cancel': {
      post: {
        tags: ['Sales'],
        summary: 'Cancela venda e devolve itens ao estoque',
        parameters: [{ $ref: '#/components/parameters/idParam' }],
        responses: {
          200: { description: 'Cancelado com sucesso' }
        }
      }
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Consulta indicadores gerais do sistema',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/reports/sales': {
      get: {
        tags: ['Reports'],
        summary: 'Gera relatório de vendas',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/reports/revenue': {
      get: {
        tags: ['Reports'],
        summary: 'Gera relatório de faturamento consolidado',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/reports/top-products': {
      get: {
        tags: ['Reports'],
        summary: 'Gera relatório de produtos mais vendidos',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/reports/top-services': {
      get: {
        tags: ['Reports'],
        summary: 'Gera relatório de serviços mais prestados',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    },
    '/reports/appointments': {
      get: {
        tags: ['Reports'],
        summary: 'Gera relatório de atendimentos e agendamentos',
        responses: {
          200: { description: 'Sucesso' }
        }
      }
    }
  }
}