// frontend/src/components/ExperienceModal.tsx

import React, { useState } from 'react';
import type { ApiResponse, CreateExperiencePayload, ExperienceFormErrors } from '../types/portfolio';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  adminToken: string;
  apiBase: string;
}

export default function ExperienceModal({
  isOpen,
  onClose,
  onSuccess,
  adminToken,
  apiBase,
}: ExperienceModalProps) {
  const [role, setRole] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  const [errors, setErrors] = useState<ExperienceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Validasi lokal sebelum payload menyentuh network
  const validateForm = (): boolean => {
    const errs: ExperienceFormErrors = {};
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!role.trim()) {
      errs.role = 'Role / Posisi wajib diisi.';
    }

    if (!company.trim()) {
      errs.company = 'Nama perusahaan atau studio wajib diisi.';
    }

    if (!startDate) {
      errs.start_date = 'Tanggal mulai wajib dipilih.';
    } else if (!dateRegex.test(startDate)) {
      errs.start_date = 'Format tanggal harus YYYY-MM-DD.';
    }

    if (!isCurrent) {
      if (!endDate) {
        errs.end_date = 'Pilih tanggal selesai atau centang "Masih berlangsung".';
      } else if (!dateRegex.test(endDate)) {
        errs.end_date = 'Format tanggal harus YYYY-MM-DD.';
      } else if (startDate && endDate < startDate) {
        // Mencegah logika waktu terbalik di level database
        errs.end_date = 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleResetAndClose = (): void => {
    setRole('');
    setCompany('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!adminToken) {
      setErrors({ general: 'Bearer Token belum terpasang di CMS toolbar.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload: CreateExperiencePayload = {
      role: role.trim(),
      company: company.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: isCurrent ? null : endDate,
    };

    try {
      const res = await fetch(`${apiBase}/admin/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<{ message: string; id: number }> = await res.json();

      if (res.ok && result.status === 'success') {
        handleResetAndClose();
        await onSuccess();
      } else {
        setErrors({ general: result.message || 'Gagal menyimpan data experience.' });
      }
    } catch {
      setErrors({ general: 'Gagal terhubung ke backend server PHP.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleResetAndClose} role="dialog" aria-modal="true">
      {/* Mencegah modal tertutup saat mengklik area konten form */}
      <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tambah Riwayat Pengalaman</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleResetAndClose}
            aria-label="Tutup modal"
          >
            ×
          </button>
        </div>

        {errors.general && <div className="form-error-banner">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Field: Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role / Posisi <span className="req">*</span>
            </label>
            <input
              id="role"
              type="text"
              className={`form-input ${errors.role ? 'input-error' : ''}`}
              placeholder="e.g. Gameplay Programmer"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
            />
            {errors.role && <span className="field-error-text">{errors.role}</span>}
          </div>

          {/* Field: Company */}
          <div className="form-group">
            <label className="form-label" htmlFor="company">
              Perusahaan / Studio <span className="req">*</span>
            </label>
            <input
              id="company"
              type="text"
              className={`form-input ${errors.company ? 'input-error' : ''}`}
              placeholder="e.g. Meraki Studio"
              value={company}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
            />
            {errors.company && <span className="field-error-text">{errors.company}</span>}
          </div>

          {/* Field: Rentang Tanggal */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="start_date">
                Tanggal Mulai <span className="req">*</span>
              </label>
              <input
                id="start_date"
                type="date"
                className={`form-input ${errors.start_date ? 'input-error' : ''}`}
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
              {errors.start_date && <span className="field-error-text">{errors.start_date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="end_date">
                Tanggal Selesai
              </label>
              <input
                id="end_date"
                type="date"
                disabled={isCurrent}
                className={`form-input ${errors.end_date ? 'input-error' : ''} ${
                  isCurrent ? 'input-disabled' : ''
                }`}
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
              {errors.end_date && <span className="field-error-text">{errors.end_date}</span>}
            </div>
          </div>

          {/* Checkbox Present/Current */}
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) setEndDate('');
              }}
            />
            <span className="checkbox-label">Masih aktif bekerja di posisi ini saat ini (Present)</span>
          </label>

          {/* Field: Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Ringkasan Deskripsi & Tanggung Jawab
            </label>
            <textarea
              id="description"
              rows={3}
              className="form-input form-textarea"
              placeholder="Jelaskan arsitektur yang dirancang, tech stack, atau pencapaian mekanik..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetAndClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}