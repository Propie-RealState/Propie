import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

import React from "react";

import { useRegister } from "../../context/RegisterContext";

export default function RegisterAgente() {
  const navigate = useNavigate();

  const { data, updateData } = useRegister();

  const [showPassword, setShowPassword] =
    useState(false);

  function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    navigate("/registro/verification");
  }

  function handleSocialLogin(
    provider: string
  ) {
    console.log("Login social:", provider);

    navigate("/registro/verification");
  }

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      data.email
    );

  const isPasswordValid =
    data.password.length >= 8;

  const isFormValid =
    data.firstName.trim() &&
    data.lastName.trim() &&
    isEmailValid &&
    isPasswordValid &&
    data.acceptTerms &&
    data.acceptPrivacy;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HERO */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background:
                "rgba(255,255,255,0.15)",
              border:
                "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "white",
              padding: "8px 14px",
            }}
          >
            <ArrowLeft
              size={15}
              color="white"
            />

            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Volver
            </span>
          </button>

          <PropieLogo size={38} />

          <div style={{ width: 80 }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding:
              "32px 28px 12px",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize:
                "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Creá tu cuenta de
            Propie
          </h1>

          <p
            style={{
              color:
                "rgba(255,255,255,0.72)",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            Empezá a conectar
            propietarios con
            compradores
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: 44,
            position: "relative",
            marginTop: 8,
          }}
        >
          <svg
            viewBox="0 0 390 44"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 44,
            }}
          >
            <path
              d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z"
              fill="#f5f5f7"
            />
          </svg>
        </div>
      </div>

      {/* FORM */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding:
            "24px 24px 40px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Nombre */}
          <div>
            <label>
              Nombre
            </label>

            <input
              type="text"
              value={data.firstName}
              onChange={(e) =>
                updateData({
                  firstName:
                    e.target.value,
                })
              }
              placeholder="Tu nombre"
            />
          </div>

          {/* Apellido */}
          <div>
            <label>
              Apellido
            </label>

            <input
              type="text"
              value={data.lastName}
              onChange={(e) =>
                updateData({
                  lastName:
                    e.target.value,
                })
              }
              placeholder="Tu apellido"
            />
          </div>

          {/* Email */}
          <div>
            <label>Email</label>

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
              >
                <Mail
                  size={18}
                  color="#9a9aa0"
                />
              </div>

              <input
                type="email"
                value={data.email}
                onChange={(e) =>
                  updateData({
                    email:
                      e.target.value,
                  })
                }
                placeholder="tu@email.com"
                required
                style={{
                  width: "100%",
                  padding:
                    "14px 46px",
                }}
              />

              {isEmailValid &&
                data.email && (
                  <div
                    style={{
                      position:
                        "absolute",
                      right: 16,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                    }}
                  >
                    <Check
                      size={18}
                      color="#10b981"
                    />
                  </div>
                )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label>
              Contraseña
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
              >
                <Lock
                  size={18}
                  color="#9a9aa0"
                />
              </div>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={data.password}
                onChange={(e) =>
                  updateData({
                    password:
                      e.target.value,
                  })
                }
                placeholder="Mínimo 8 caracteres"
                required
                style={{
                  width: "100%",
                  padding:
                    "14px 46px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: 16,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  background:
                    "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={
                data.acceptTerms
              }
              onChange={(e) =>
                updateData({
                  acceptTerms:
                    e.target.checked,
                })
              }
            />

            Acepto los términos y
            condiciones
          </label>

          {/* Privacy */}
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={
                data.acceptPrivacy
              }
              onChange={(e) =>
                updateData({
                  acceptPrivacy:
                    e.target.checked,
                })
              }
            />

            Acepto la política de
            privacidad
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}