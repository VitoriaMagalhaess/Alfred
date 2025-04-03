import {
    User,
    InsertUser,
    Task,
    InsertTask,
    Event,
    InsertEvent,
    Message,
    InsertMessage,
    Bill,
    InsertBill,
  } from "@shared/schema";
  
  export interface IStorage {
    // User operations
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    
    // Task operations
    getTasks(userId: number): Promise<Task[]>;
    getTaskById(id: number): Promise<Task | undefined>;
    createTask(task: InsertTask): Promise<Task>;
    updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
    deleteTask(id: number): Promise<boolean>;
    
    // Event operations
    getEvents(userId: number): Promise<Event[]>;
    getEventById(id: number): Promise<Event | undefined>;
    createEvent(event: InsertEvent): Promise<Event>;
    updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
    deleteEvent(id: number): Promise<boolean>;
    
    // Message operations
    getMessages(userId: number): Promise<Message[]>;
    getMessageById(id: number): Promise<Message | undefined>;
    createMessage(message: InsertMessage): Promise<Message>;
    updateMessage(id: number, message: Partial<Message>): Promise<Message | undefined>;
    deleteMessage(id: number): Promise<boolean>;
    
    // Bill operations
    getBills(userId: number): Promise<Bill[]>;
    getBillById(id: number): Promise<Bill | undefined>;
    createBill(bill: InsertBill): Promise<Bill>;
    updateBill(id: number, bill: Partial<Bill>): Promise<Bill | undefined>;
    deleteBill(id: number): Promise<boolean>;
  }
  
  export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private tasks: Map<number, Task>;
    private events: Map<number, Event>;
    private messages: Map<number, Message>;
    private bills: Map<number, Bill>;
    
    private currentUserId: number;
    private currentTaskId: number;
    private currentEventId: number;
    private currentMessageId: number;
    private currentBillId: number;
    
    constructor() {
      this.users = new Map();
      this.tasks = new Map();
      this.events = new Map();
      this.messages = new Map();
      this.bills = new Map();
      
      this.currentUserId = 1;
      this.currentTaskId = 1;
      this.currentEventId = 1;
      this.currentMessageId = 1;
      this.currentBillId = 1;
    }
    
    // Implementação de User
    async getUser(id: number): Promise<User | undefined> {
      return this.users.get(id);
    }
    
    async getUserByUsername(username: string): Promise<User | undefined> {
      for (const user of this.users.values()) {
        if (user.username === username) {
          return user;
        }
      }
      return undefined;
    }
    
    async createUser(insertUser: InsertUser): Promise<User> {
      const id = this.currentUserId++;
      const user: User = { ...insertUser, id };
      this.users.set(id, user);
      return user;
    }
    
    // Implementação de Task
    async getTasks(userId: number): Promise<Task[]> {
      const userTasks: Task[] = [];
      for (const task of this.tasks.values()) {
        if (task.userId === userId) {
          userTasks.push(task);
        }
      }
      return userTasks;
    }
    
    async getTaskById(id: number): Promise<Task | undefined> {
      return this.tasks.get(id);
    }
    
    async createTask(task: InsertTask): Promise<Task> {
      const id = this.currentTaskId++;
      const newTask: Task = { ...task, id };
      if (task.dueDate && typeof task.dueDate === 'string') {
        newTask.dueDate = new Date(task.dueDate);
      }
      this.tasks.set(id, newTask);
      return newTask;
    }
    
    async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
      const existingTask = this.tasks.get(id);
      if (!existingTask) {
        return undefined;
      }
      
      const updatedTask = { ...existingTask, ...taskUpdate };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    
    async deleteTask(id: number): Promise<boolean> {
      return this.tasks.delete(id);
    }
    
    // Implementação de Event
    async getEvents(userId: number): Promise<Event[]> {
      const userEvents: Event[] = [];
      for (const event of this.events.values()) {
        if (event.userId === userId) {
          userEvents.push(event);
        }
      }
      return userEvents;
    }
    
    async getEventById(id: number): Promise<Event | undefined> {
      return this.events.get(id);
    }
    
    async createEvent(event: InsertEvent): Promise<Event> {
      const id = this.currentEventId++;
      const newEvent: Event = { ...event, id };
      if (event.startDate && typeof event.startDate === 'string') {
        newEvent.startDate = new Date(event.startDate);
      }
      if (event.endDate && typeof event.endDate === 'string') {
        newEvent.endDate = new Date(event.endDate);
      }
      this.events.set(id, newEvent);
      return newEvent;
    }
    
    async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
      const existingEvent = this.events.get(id);
      if (!existingEvent) {
        return undefined;
      }
      
      const updatedEvent = { ...existingEvent, ...eventUpdate };
      this.events.set(id, updatedEvent);
      return updatedEvent;
    }
    
    async deleteEvent(id: number): Promise<boolean> {
      return this.events.delete(id);
    }
    
    // Implementação de Message
    async getMessages(userId: number): Promise<Message[]> {
      const userMessages: Message[] = [];
      for (const message of this.messages.values()) {
        if (message.userId === userId) {
          userMessages.push(message);
        }
      }
      return userMessages;
    }
    
    async getMessageById(id: number): Promise<Message | undefined> {
      return this.messages.get(id);
    }
    
    async createMessage(message: InsertMessage): Promise<Message> {
      const id = this.currentMessageId++;
      const newMessage: Message = { ...message, id };
      this.messages.set(id, newMessage);
      return newMessage;
    }
    
    async updateMessage(id: number, messageUpdate: Partial<Message>): Promise<Message | undefined> {
      const existingMessage = this.messages.get(id);
      if (!existingMessage) {
        return undefined;
      }
      
      const updatedMessage = { ...existingMessage, ...messageUpdate };
      this.messages.set(id, updatedMessage);
      return updatedMessage;
    }
    
    async deleteMessage(id: number): Promise<boolean> {
      return this.messages.delete(id);
    }
    
    // Implementação de Bill
    async getBills(userId: number): Promise<Bill[]> {
      const userBills: Bill[] = [];
      for (const bill of this.bills.values()) {
        if (bill.userId === userId) {
          userBills.push(bill);
        }
      }
      return userBills;
    }
    
    async getBillById(id: number): Promise<Bill | undefined> {
      return this.bills.get(id);
    }
    
    async createBill(bill: InsertBill): Promise<Bill> {
      const id = this.currentBillId++;
      const newBill: Bill = { ...bill, id };
      if (bill.dueDate && typeof bill.dueDate === 'string') {
        newBill.dueDate = new Date(bill.dueDate);
      }
      this.bills.set(id, newBill);
      return newBill;
    }
    
    async updateBill(id: number, billUpdate: Partial<Bill>): Promise<Bill | undefined> {
      const existingBill = this.bills.get(id);
      if (!existingBill) {
        return undefined;
      }
      
      const updatedBill = { ...existingBill, ...billUpdate };
      this.bills.set(id, updatedBill);
      return updatedBill;
    }
    
    async deleteBill(id: number): Promise<boolean> {
      return this.bills.delete(id);
    }
  }
  
  export const storage = new MemStorage();