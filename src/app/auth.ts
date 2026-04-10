import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getSupabase } from './supabase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center wave-bg p-4">
      <div class="glass p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black font-headline text-primary mb-2">RPG Nexus</h1>
          <p class="text-on-surface-variant font-medium">
            {{ isLogin() ? 'Bem-vindo de volta, aventureiro!' : 'Comece sua jornada agora.' }}
          </p>
        </div>

        <form (submit)="handleSubmit($event)" class="space-y-4">
          @if (!isLogin()) {
            <div>
              <label for="displayName" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Nome de Exibição</label>
              <input id="displayName" type="text" [(ngModel)]="displayName" name="displayName" class="input-field" placeholder="Ex: Mestre Arcanis" required>
            </div>
            <div>
              <label for="role" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Categoria</label>
              <select id="role" [(ngModel)]="role" name="role" class="input-field" required>
                <option value="Jogador">Jogador</option>
                <option value="Mestre">Mestre</option>
                <option value="Mestre e Jogador">Mestre e Jogador</option>
              </select>
            </div>
          }

          <div>
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">E-mail</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" class="input-field" placeholder="seu@email.com" required>
          </div>

          <div>
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-outline mb-1 ml-1">Senha</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" class="input-field" placeholder="••••••••" required>
          </div>

          @if (error()) {
            <div class="p-3 bg-tertiary/10 text-tertiary text-xs font-bold rounded-xl border border-tertiary/20">
              {{ error() }}
            </div>
          }

          <button type="submit" class="btn-primary w-full mt-4" [disabled]="loading()">
            @if (loading()) {
              <span class="material-icons animate-spin">sync</span>
            }
            {{ isLogin() ? 'Entrar no Reino' : 'Criar Personagem' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button (click)="toggleMode()" class="text-sm font-bold text-primary hover:underline">
            {{ isLogin() ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AuthComponent {
  private router = inject(Router);
  
  get supabase() {
    return getSupabase();
  }

  isLogin = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  email = '';
  password = '';
  displayName = '';
  role = 'Jogador';

  toggleMode() {
    this.isLogin.update(v => !v);
    this.error.set(null);
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.isLogin()) {
        const { error } = await this.supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        });
        if (error) throw error;
      } else {
        const { error } = await this.supabase.auth.signUp({
          email: this.email,
          password: this.password,
          options: {
            data: {
              display_name: this.displayName,
              role: this.role
            }
          }
        });
        if (error) throw error;

        alert('Cadastro realizado! Bem-vindo ao Nexus. Verifique seu e-mail se necessário.');
        this.isLogin.set(true);
      }
      
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
