import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { auth, dataconnect } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { Router } from '@angular/router';

interface Profile {
  id: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
}

interface Instance {
  id: string;
  name: string;
  description: string;
  status: string;
  maxPlayers: number;
  ownerId: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <!-- Top Bar -->
      <header class="glass sticky top-0 z-40 px-8 py-4 flex justify-between items-center shadow-sm">
        <div class="flex items-center gap-4">
          <span class="text-2xl font-black font-headline text-primary tracking-tight">RPG Nexus</span>
          <nav class="hidden md:flex gap-6 ml-8">
            <a class="text-primary font-bold border-b-2 border-primary py-1" href="#">Dashboard</a>
            <a class="text-outline hover:text-primary transition-colors font-bold py-1" href="#">Minhas Campanhas</a>
            <a class="text-outline hover:text-primary transition-colors font-bold py-1" href="#">Biblioteca</a>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <div class="font-bold text-sm">{{ userProfile()?.displayName }}</div>
            <div class="text-xs text-outline font-medium">{{ userProfile()?.role }}</div>
          </div>
          <button (click)="logout()" class="p-2 text-outline hover:text-tertiary transition-colors rounded-full hover:bg-tertiary/5">
            <span class="material-icons">logout</span>
          </button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <aside class="hidden lg:flex flex-col p-6 w-72 bg-white/50 border-r border-outline-variant/10">
          <div class="mb-8">
            <button (click)="showCreateModal.set(true)" class="btn-primary w-full">
              <span class="material-icons">add</span>
              Nova Instância
            </button>
          </div>
          <nav class="space-y-1">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-bold">
              <span class="material-icons">dashboard</span> Dashboard
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl text-outline hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
              <span class="material-icons">groups</span> Jogadores
            </div>
            <div class="flex items-center gap-3 p-3 rounded-xl text-outline hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
              <span class="material-icons">auto_stories</span> Regras
            </div>
            @if (userProfile()?.isAdmin) {
              <div class="pt-4 mt-4 border-t border-outline-variant/10">
                <div class="text-xs font-bold text-outline uppercase tracking-widest mb-2 px-3">Admin</div>
                <div class="flex items-center gap-3 p-3 rounded-xl text-outline hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">
                  <span class="material-icons">admin_panel_settings</span> Gestão de Usuários
                </div>
              </div>
            }
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8 overflow-y-auto wave-bg">
          <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-end mb-8">
              <div>
                <h1 class="text-4xl font-black font-headline tracking-tight mb-2">Suas Instâncias</h1>
                <p class="text-on-surface-variant font-medium">Gerencie suas campanhas e salas de jogo.</p>
              </div>
              <div class="flex gap-3">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10">
                  <div class="text-xs font-bold text-outline uppercase">Total</div>
                  <div class="text-2xl font-black">{{ instances().length }}</div>
                </div>
              </div>
            </div>

            <!-- Grid of Instances -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (inst of instances(); track inst.id) {
                <div class="glass p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                  
                  <div class="flex justify-between items-start mb-4 relative z-10">
                    <div class="p-3 bg-primary/10 rounded-2xl text-primary">
                      <span class="material-icons">sports_esports</span>
                    </div>
                    <div class="flex gap-1">
                      <button (click)="editInstance(inst)" class="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button (click)="deleteInstance(inst.id)" class="p-2 text-outline hover:text-tertiary hover:bg-tertiary/5 rounded-lg transition-all">
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  <h3 class="text-xl font-black font-headline mb-2">{{ inst.name }}</h3>
                  <p class="text-on-surface-variant text-sm mb-4 line-clamp-2">{{ inst.description }}</p>
                  
                  <div class="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {{ inst.status }}
                    </span>
                    <span class="text-xs font-bold text-outline">{{ inst.maxPlayers }} Jogadores</span>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-20 text-center">
                  <div class="text-outline mb-4">
                    <span class="material-icons text-6xl">explore_off</span>
                  </div>
                  <h3 class="text-xl font-bold text-outline">Nenhuma instância encontrada</h3>
                  <p class="text-on-surface-variant">Comece criando sua primeira campanha!</p>
                </div>
              }
            </div>
          </div>
        </main>
      </div>

      <!-- Create/Edit Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
          <div class="glass p-8 rounded-3xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <h2 class="text-2xl font-black font-headline mb-6">{{ editingId() ? 'Editar Instância' : 'Nova Instância' }}</h2>
            
            <form (submit)="saveInstance($event)" class="space-y-4">
              <div>
                <label for="instName" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Nome da Campanha</label>
                <input id="instName" type="text" [(ngModel)]="form.name" name="name" class="input-field" placeholder="Ex: Crônicas de Eldoria" required>
              </div>
              <div>
                <label for="instDesc" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Descrição</label>
                <textarea id="instDesc" [(ngModel)]="form.description" name="description" class="input-field h-24 resize-none" placeholder="Conte um pouco sobre a aventura..."></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="instStatus" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Status</label>
                  <select id="instStatus" [(ngModel)]="form.status" name="status" class="input-field">
                    <option value="Ativa">Ativa</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>
                <div>
                  <label for="instPlayers" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Máx. Jogadores</label>
                  <input id="instPlayers" type="number" [(ngModel)]="form.maxPlayers" name="maxPlayers" class="input-field" min="1" max="100">
                </div>
              </div>

              <div class="flex gap-3 mt-8">
                <button type="button" (click)="closeModal()" class="flex-1 px-6 py-3 font-bold text-outline hover:bg-outline-variant/10 rounded-xl transition-all">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary flex-1">
                  {{ editingId() ? 'Salvar Alterações' : 'Criar Agora' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  
  userProfile = signal<Profile | null>(null);
  instances = signal<Instance[]>([]);
  showCreateModal = signal(false);
  editingId = signal<string | null>(null);

  form = {
    name: '',
    description: '',
    status: 'Ativa',
    maxPlayers: 5
  };

  async ngOnInit() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }

      try {
        const { data } = await executeQuery(queryRef(dataconnect, 'GetProfile', { id: user.uid }));
        const profileData = data as { profile: Profile | null };
        if (profileData?.profile) {
          this.userProfile.set(profileData.profile);
        }
        this.loadInstances();
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    });
  }

  async loadInstances() {
    try {
      const { data } = await executeQuery(queryRef(dataconnect, 'ListInstances'));
      const instancesData = data as { instances: Instance[] };
      if (instancesData?.instances) {
        this.instances.set(instancesData.instances);
      }
    } catch (err) {
      console.error('Error loading instances:', err);
    }
  }

  async saveInstance(event: Event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (this.editingId()) {
        await executeMutation(mutationRef(dataconnect, 'UpdateInstance', {
          id: this.editingId(),
          ...this.form
        }));
      } else {
        await executeMutation(mutationRef(dataconnect, 'CreateInstance', this.form));
      }

      this.closeModal();
      this.loadInstances();
    } catch (err) {
      console.error('Error saving instance:', err);
    }
  }

  editInstance(inst: Instance) {
    this.editingId.set(inst.id);
    this.form = {
      name: inst.name,
      description: inst.description,
      status: inst.status,
      maxPlayers: inst.maxPlayers
    };
    this.showCreateModal.set(true);
  }

  async deleteInstance(id: string) {
    if (confirm('Tem certeza que deseja apagar esta instância?')) {
      try {
        await executeMutation(mutationRef(dataconnect, 'DeleteInstance', { id }));
        this.loadInstances();
      } catch (err) {
        console.error('Error deleting instance:', err);
      }
    }
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.editingId.set(null);
    this.form = {
      name: '',
      description: '',
      status: 'Ativa',
      maxPlayers: 5
    };
  }

  async logout() {
    await signOut(auth);
    this.router.navigate(['/auth']);
  }
}
