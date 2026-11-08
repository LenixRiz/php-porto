// frontend/src/App.tsx

import React, { useEffect, useState } from 'react';
import './App.css';
import type {
  PortfolioData,
  ApiResponse,
  HeroFormState,
  Skill,
  Experience,
  CreateSkillPayload,
} from './types/portfolio';
import ExperienceModal from './components/ExperienceModal';

const API_BASE = 'http://127.0.0.1:8000/api';

const SKILL_CATEGORIES = ['General'] as const;

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string>(
    () => localStorage.getItem('admin_token') || ''
  );
  const [isEditingHero, setIsEditingHero] = useState<boolean>(false);
  const [heroForm, setHeroForm] = useState<HeroFormState>({ title: '', description: '' });

  // State Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddingSkill, setIsAddingSkill] = useState<boolean>(false);
  const [skillForm, setSkillForm] = useState<CreateSkillPayload>({
    name: '',
    category: 'Backend',
  });
  const [isSubmittingSkill, setIsSubmittingSkill] = useState<boolean>(false);

  // 1. Initial Fetch (Linter-compliant)
  useEffect(() => {
    let ignore = false;

    fetch(`${API_BASE}/portfolio`)
      .then((res) => res.json())
      .then((json: ApiResponse<PortfolioData>) => {
        if (!ignore && json.status === 'success' && json.data) {
          setData(json.data);
          setHeroForm({
            title: json.data.hero.title,
            description: json.data.hero.description,
          });
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Initial fetch error:', err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // 2. Fungsi reload data khusus dipanggil setelah aksi mutasi data
  const refreshData = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`);
      const json: ApiResponse<PortfolioData> = await res.json();
      if (json.status === 'success' && json.data) {
        setData(json.data);
        setHeroForm({
          title: json.data.hero.title,
          description: json.data.hero.description,
        });
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleSaveToken = (val: string): void => {
    setAdminToken(val);
    localStorage.setItem('admin_token', val);
  };

  // Update Hero Section (PUT /api/admin/hero)
  const handleUpdateHero = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!adminToken) {
      alert('Masukkan Bearer Token terlebih dahulu.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(heroForm),
      });

      const result: ApiResponse<{ message: string }> = await res.json();
      if (res.ok && result.status === 'success') {
        setIsEditingHero(false);
        await refreshData();
      } else {
        alert(result.message || 'Gagal menyimpan perubahan.');
      }
    } catch {
      alert('Koneksi ke server backend gagal.');
    }
  };

  // Tambah Skill Baru (POST /api/admin/skills)
  const handleCreateSkill = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!adminToken) {
      alert('Masukkan Bearer Token di pojok kanan bawah terlebih dahulu.');
      return;
    }

    if (!skillForm.name.trim()) {
      alert('Nama skill tidak boleh kosong.');
      return;
    }

    setIsSubmittingSkill(true);
    try {
      const res = await fetch(`${API_BASE}/admin/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: skillForm.name.trim(),
          category: skillForm.category,
        }),
      });

      const result: ApiResponse<{ message: string; id: number }> = await res.json();

      if (res.ok && result.status === 'success') {
        setSkillForm({ name: '', category: 'Backend' });
        setIsAddingSkill(false);
        await refreshData();
      } else {
        alert(result.message || 'Gagal menambahkan skill.');
      }
    } catch {
      alert('Gagal menghubungi backend PHP.');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  // Delete Tag Skill (DELETE /api/admin/skills/:id)
  const handleDeleteSkill = async (id: number): Promise<void> => {
    if (!adminToken) {
      alert('Ketik Bearer Token di pojok kanan bawah terlebih dahulu.');
      return;
    }

    if (!window.confirm('Hapus tag skill ini dari database?')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/skills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        await refreshData();
      } else {
        const err: ApiResponse<null> = await res.json();
        alert(err.message || 'Gagal menghapus skill.');
      }
    } catch {
      alert('Gagal menghubungi backend.');
    }
  };

  // Delete Experience Card (DELETE /api/admin/experiences/:id)
  const handleDeleteExperience = async (id: number): Promise<void> => {
    if (!adminToken) {
      alert('Masukkan Bearer Token di pojok kanan bawah terlebih dahulu.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus kartu pengalaman ini dari database?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/experiences/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const result: ApiResponse<{ message: string }> = await res.json();

      if (res.ok && result.status === 'success') {
        await refreshData();
      } else {
        alert(result.message || 'Gagal menghapus pengalaman.');
      }
    } catch {
      alert('Gagal menghubungi backend PHP.');
    }
  };

  const getTagClass = (category: string = ''): string => {
    const c = category.toLowerCase();
    if (c.includes('backend')) return 'backend';
    if (c.includes('database')) return 'database';
    if (c.includes('game')) return 'gamedev';
    return 'general';
  };

  if (loading) {
    return (
      <div className="container" style={{ color: 'var(--text-muted)' }}>
        Menyiapkan kanvas portofolio...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container" style={{ color: '#C53030' }}>
        Gagal memuat data dari backend PHP native. Pastikan server PHP dan MySQL aktif.
      </div>
    );
  }

  return (
    <div className="container">
      {/* Floating Navbar */}
      <nav className="portfolio-nav">
        <a href="#about" className="nav-brand">
          Easter<span>.</span>
        </a>
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#skills" className="nav-link">Disciplines</a>
          <a href="#experience" className="nav-link">Experience</a>
        </div>
      </nav>

    <div className="container">
      {/* Hero Section */}
      <header className="hero-header" id="about">
        {/* <div className="hero-status-pill">
          <span className="status-dot"></span> Available for projects
        </div> */}

        {isEditingHero ? (
          <form
            onSubmit={handleUpdateHero}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}
          >
            <input
              type="text"
              className="admin-input"
              value={heroForm.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setHeroForm((prev: HeroFormState) => ({ ...prev, title: e.target.value }))
              }
              required
              style={{ fontSize: '1.2rem', padding: '0.5rem' }}
            />
            <textarea
              className="admin-input"
              value={heroForm.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setHeroForm((prev: HeroFormState) => ({ ...prev, description: e.target.value }))
              }
              required
              rows={3}
              style={{ fontSize: '0.95rem', padding: '0.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary">
                Simpan ke MySQL
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#E5DFD5', color: '#1C2024' }}
                onClick={() => setIsEditingHero(false)}
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="hero-title">{data.hero.title}</h1>
            <p className="hero-desc">{data.hero.description}</p>
            {adminToken && (
              <button
                onClick={() => setIsEditingHero(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  textDecoration: 'underline',
                }}
              >
                Edit Teks Hero
              </button>
            )}
          </>
        )}
      </header>

      {/* Skills Section */}
      <section id="skills">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
            Disciplines & Skills
          </h2>
          {adminToken && (
            <button
              type="button"
              className="section-action-btn"
              onClick={() => setIsAddingSkill((prev) => !prev)}
            >
              {isAddingSkill ? 'Tutup Form' : '+ Tambah Skill'}
            </button>
          )}
        </div>

        {/* Form Inline Penambahan Skill */}
        {adminToken && isAddingSkill && (
          <form onSubmit={handleCreateSkill} className="skill-add-form">
            <input
              type="text"
              className="form-input"
              placeholder="Nama skill (misal: Ms.Word , Graphic Design, Editing)"
              value={skillForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSkillForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              style={{ flex: 1 }}
            />
            <select
              className="form-input"
              value={skillForm.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSkillForm((prev) => ({ ...prev, category: e.target.value }))
              }
              style={{ width: '170px' }}
            >
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary" disabled={isSubmittingSkill}>
              {isSubmittingSkill ? 'Menyimpan...' : 'Tambah'}
            </button>
          </form>
        )}

        <div className="skills-grid">
          {data.skills.map((skill: Skill) => (
            <span key={skill.id} className={`skill-tag ${getTagClass(skill.category)}`}>
              {skill.name}
              {adminToken && (
                <button
                  type="button"
                  className="tag-delete-btn"
                  onClick={() => handleDeleteSkill(skill.id)}
                  aria-label={`Hapus ${skill.name}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* Experience Cards */}
      <section id="experience">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0, flex: 1 }}>
            Experience & Track Record
          </h2>
          {adminToken && (
            <button
              type="button"
              className="section-action-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Tambah Posisi
            </button>
          )}
        </div>

        <div className="experience-list">
          {data.experiences.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Belum ada riwayat pengalaman yang tercatat.
            </p>
          ) : (
            data.experiences.map((exp: Experience) => (
              <article key={exp.id} className="experience-card">
                <div className="exp-header">
                  <div className="exp-role">
                    {exp.role} <span className="exp-company">/ {exp.company}</span>
                  </div>

                  <div className="exp-meta">
                    <span className="exp-date">
                      {exp.start_date.substring(0, 7)} — {exp.end_date ? exp.end_date.substring(0, 7) : 'Present'}
                    </span>
                    {adminToken && (
                      <button
                        type="button"
                        className="exp-delete-btn"
                        onClick={() => handleDeleteExperience(exp.id)}
                        aria-label={`Hapus ${exp.role}`}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
                <p className="exp-desc">{exp.description}</p>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="portfolio-footer">
        <p className="footer-text">
          Made with love for Maria by <span>Lenix aka Rizky</span>
        </p>
      </footer>
    </div>

      {/* Floating CMS Toolbar */}
      <aside className="admin-toolbar">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          CMS:
        </span>
        <input
          type="password"
          placeholder="Bearer Token"
          className="admin-input"
          value={adminToken}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSaveToken(e.target.value)}
        />
      </aside>

      {/* Modal Dialog Form Tambah Experience */}
      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
        adminToken={adminToken}
        apiBase={API_BASE}
      />
    </div>
  );
}