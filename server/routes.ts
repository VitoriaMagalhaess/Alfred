import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertEventSchema, 
  insertMessageSchema, 
  insertBillSchema,
  User
} from "@shared/schema";
import { log } from "./vite";
import { z } from "zod";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração da sessão
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "alfred-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 8 * 60 * 60 * 1000, // 8 horas
      },
    })
  );

  // Configuração do Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Usuário incorreto." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Senha incorreta." });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware para verificar autenticação
  const isAuthenticated = async (req: Request, res: Response, next: express.NextFunction) => {
    // Para fins de desenvolvimento, vamos simular um usuário autenticado
    if (!req.user) {
      const demoUser = await storage.getUserByUsername("demo");
      req.user = demoUser;
    }
    next();
  };

  // Inicializar dados de demonstração
  await initializeDemoData();

  // Rotas de autenticação
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/me", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Rotas para tarefas
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    const user = req.user as User;
    const tasks = await storage.getTasks(user.id);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(task);
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const taskData = insertTaskSchema.parse({ ...req.body, userId: user.id });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar tarefa" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir tarefa" });
    }
  });

  // Rotas para eventos
  app.get("/api/events", isAuthenticated, async (req, res) => {
    const user = req.user as User;
    const events = await storage.getEvents(user.id);
    res.json(events);
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const event = await storage.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    res.json(event);
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const eventData = insertEventSchema.parse({ ...req.body, userId: user.id });
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar evento" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar evento" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir evento" });
    }
  });

  // Rotas para mensagens
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    const user = req.user as User;
    const messages = await storage.getMessages(user.id);
    res.json(messages);
  });

  app.get("/api/messages/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const message = await storage.getMessageById(id);
    if (!message) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }
    res.json(message);
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const messageData = insertMessageSchema.parse({ ...req.body, userId: user.id });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar mensagem" });
    }
  });

  app.patch("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.updateMessage(id, req.body);
      if (!message) {
        return res.status(404).json({ error: "Mensagem não encontrada" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar mensagem" });
    }
  });

  app.delete("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMessage(id);
      if (!success) {
        return res.status(404).json({ error: "Mensagem não encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir mensagem" });
    }
  });

  // Rotas para contas
  app.get("/api/bills", isAuthenticated, async (req, res) => {
    const user = req.user as User;
    const bills = await storage.getBills(user.id);
    res.json(bills);
  });

  app.get("/api/bills/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const bill = await storage.getBillById(id);
    if (!bill) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }
    res.json(bill);
  });

  app.post("/api/bills", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const billData = insertBillSchema.parse({ ...req.body, userId: user.id });
      const bill = await storage.createBill(billData);
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  app.patch("/api/bills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.updateBill(id, req.body);
      if (!bill) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar conta" });
    }
  });

  app.delete("/api/bills/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBill(id);
      if (!success) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir conta" });
    }
  });

  return app;
}

// Função para inicializar dados de demonstração
async function initializeDemoData() {
  try {
    // Verifica se já existe um usuário de demonstração
    const existingUser = await storage.getUserByUsername("demo");
    if (!existingUser) {
      const user = await storage.createUser({
        username: "demo",
        password: "password",
        displayName: "Bruce Wayne",
        email: "bruce@wayneenterprises.com",
        profilePicture: "https://i.pravatar.cc/150?u=demo",
        role: "admin",
      });

      // Cria tarefas de exemplo
      await storage.createTask({
        userId: user.id,
        title: "Reunião com equipe de desenvolvimento",
        description: "Discussão sobre novos recursos do projeto",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        priority: "high",
        completed: false,
      });

      await storage.createTask({
        userId: user.id,
        title: "Revisar relatórios financeiros",
        description: "Análise dos resultados do último trimestre",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        priority: "medium",
        completed: false,
      });

      await storage.createTask({
        userId: user.id,
        title: "Atualizar software antivírus",
        description: "Instalar a última versão nos servidores",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        priority: "low",
        completed: false,
      });

      // Cria eventos de exemplo
      await storage.createEvent({
        userId: user.id,
        title: "Apresentação de projeto",
        description: "Demonstração dos novos recursos para os investidores",
        location: "Sala de Conferências",
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 horas depois
        priority: "high",
      });

      await storage.createEvent({
        userId: user.id,
        title: "Almoço com parceiros",
        description: "Discussão de novas parcerias estratégicas",
        location: "Restaurante Central",
        startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 dias
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5 horas depois
        priority: "medium",
      });

      await storage.createEvent({
        userId: user.id,
        title: "Conferência de Tecnologia",
        description: "Participação como palestrante sobre IA",
        location: "Centro de Convenções",
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 2 dias de evento
        priority: "medium",
      });

      // Cria mensagens de exemplo
      await storage.createMessage({
        userId: user.id,
        senderName: "Ana Oliveira",
        senderEmail: "ana@empresa.com",
        subject: "Proposta de colaboração",
        content: "Olá Bruce, gostaria de discutir uma possível parceria entre nossas empresas. Podemos marcar uma reunião na próxima semana?",
        source: "email",
        read: false,
      });

      await storage.createMessage({
        userId: user.id,
        senderName: "Carlos Santos",
        senderEmail: "carlos@tech.com",
        subject: "Relatório mensal",
        content: "Segue anexo o relatório de desempenho do último mês. Os resultados foram bem positivos!",
        source: "email",
        read: true,
      });

      await storage.createMessage({
        userId: user.id,
        senderName: "Luiz Silva",
        senderEmail: "+5511999887766",
        subject: "Confirmação de presença",
        content: "Bruce, confirmo minha presença na reunião de amanhã às 14h. Abraços!",
        source: "whatsapp",
        read: false,
      });

      // Cria contas de exemplo
      await storage.createBill({
        userId: user.id,
        name: "Conta de Luz",
        description: "Fatura mensal de energia elétrica",
        amount: "250,00",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
        category: "Utilidades",
        paid: false,
      });

      await storage.createBill({
        userId: user.id,
        name: "Aluguel do Escritório",
        description: "Pagamento mensal do espaço comercial",
        amount: "3.500,00",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
        category: "Imóveis",
        paid: false,
      });

      await storage.createBill({
        userId: user.id,
        name: "Assinatura de Software",
        description: "Licença anual do pacote de design",
        amount: "1.200,00",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
        category: "Tecnologia",
        paid: true,
      });

      log("Dados de demonstração criados com sucesso");
    }
  } catch (error) {
    log(`Erro ao criar dados de demonstração: ${error}`, "error");
  }
}