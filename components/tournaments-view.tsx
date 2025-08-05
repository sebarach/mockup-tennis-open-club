"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calendar,
  Users,
  Award,
  Plus,
  Pencil,
  Eye,
  Info,
  UserPlus,
  BarChart3,
  Network,
  Settings,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  tournamentsAPI,
  playersAPI,
  tournamentRegistrationsAPI,
  supabase,
} from "@/lib/supabase";

export function TournamentsView() {
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [tournamentStats, setTournamentStats] = useState([
    { label: "Torneos Totales", value: "0", icon: Trophy },
    { label: "Participantes Únicos", value: "0", icon: Users },
    { label: "Premios Entregados", value: "$0", icon: Award },
    { label: "Partidos Jugados", value: "0", icon: Calendar },
  ]);
  const [loading, setLoading] = useState(true);

  // Función para cargar todos los torneos
  const loadTournaments = async () => {
    try {
      setLoading(true);

      // Obtener todos los torneos usando la API
      const tournaments = await tournamentsAPI.getAll();

      // Separar por estado
      const active = tournaments.filter((t) => t.status === "ongoing");
      const upcoming = tournaments.filter((t) => t.status === "upcoming");
      const past = tournaments.filter((t) => t.status === "completed");

      console.log("Torneos cargados:", tournaments.length);
      console.log("Torneos por estado:", {
        active: active.length,
        upcoming: upcoming.length,
        past: past.length,
      });
      console.log(
        "Estados encontrados:",
        tournaments.map((t) => t.status)
      );

      setActiveTournaments(active);
      setUpcomingTournaments(upcoming);
      setPastTournaments(past);

      // Obtener estadísticas
      const stats = await tournamentsAPI.getStats();

      setTournamentStats([
        {
          label: "Torneos Totales",
          value: stats.totalTournaments.toString(),
          icon: Trophy,
        },
        {
          label: "Participantes Únicos",
          value: stats.uniqueParticipants.toString(),
          icon: Users,
        },
        {
          label: "Premios Entregados",
          value: `$${stats.totalPrizePool.toLocaleString()}`,
          icon: Award,
        },
        {
          label: "Partidos Jugados",
          value: stats.matchesPlayed.toString(),
          icon: Calendar,
        },
      ]);
    } catch (error) {
      console.error("Error cargando torneos:", error);
      Swal.fire({
        title: "Error",
        text: `No se pudieron cargar los torneos: ${error.message}`,
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar torneo
  const handleAddTournament = async () => {
    // Cargar jugadores disponibles
    let availablePlayers = [];
    try {
      availablePlayers = await playersAPI.getAll();
    } catch (error) {
      console.error("Error cargando jugadores:", error);
    }

    const { value: formData } = await Swal.fire({
      title:
        '<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">🏆 Crear Nuevo Torneo</span>',
      html: `
        <style>
          .responsive-tournament-form {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .responsive-tournament-form .form-group {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .responsive-tournament-form label {
            display: block;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 600;
            margin-bottom: 6px;
            color: #10b981;
            text-align: left;
          }
          .responsive-tournament-form .form-input,
          .responsive-tournament-form .form-textarea,
          .responsive-tournament-form .form-select {
            width: 100%;
            padding: clamp(8px, 2vw, 12px);
            border: 1px solid #4b5563;
            border-radius: 6px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            transition: all 0.3s ease;
            box-sizing: border-box;
          }
          .responsive-tournament-form .form-input:focus,
          .responsive-tournament-form .form-textarea:focus,
          .responsive-tournament-form .form-select:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .responsive-tournament-form .form-input::placeholder,
          .responsive-tournament-form .form-textarea::placeholder {
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .responsive-tournament-form .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(12px, 3vw, 16px);
            background: transparent;
            padding: 0;
            border-radius: 0;
          }
          @media (min-width: 640px) {
            .responsive-tournament-form .form-row {
              grid-template-columns: 1fr 1fr;
            }
          }
          .responsive-tournament-form .form-textarea {
            resize: vertical;
            min-height: 80px;
          }
          
          /* Players Selection Styles */
          .players-dropdown {
            position: relative;
          }
          
          .players-dropdown-trigger {
            width: 100%;
            padding: clamp(8px, 2vw, 12px);
            border: 1px solid #4b5563;
            border-radius: 6px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            cursor: pointer;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
          }
          
          .players-dropdown-trigger:hover {
            border-color: #10b981;
          }
          
          .players-dropdown-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1f2937;
            border: 1px solid #4b5563;
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            margin-top: 2px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          
          .players-dropdown-content.show {
            display: block;
          }
          
          .player-item {
            padding: 8px 12px;
            border-bottom: 1px solid #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
          }
          
          .player-item:hover {
            background-color: #374151;
          }
          
          .player-item:last-child {
            border-bottom: none;
          }
          
          .player-checkbox {
            margin: 0;
            accent-color: #10b981;
          }
          
          .player-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .player-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #10b981;
          }
          
          .player-details {
            flex: 1;
          }
          
          .player-name {
            font-weight: 500;
            color: #f9fafb;
            font-size: 14px;
          }
          
          .player-rank {
            font-size: 12px;
            color: #9ca3af;
          }
          
          .selected-players-count {
            background: #10b981;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .dropdown-arrow {
            transition: transform 0.2s;
          }
          
          .dropdown-arrow.rotated {
            transform: rotate(180deg);
          }
          
          /* Round Robin Groups Styles */
          #round-robin-config {
            background: #1e3a8a !important;
            border: 2px solid #3b82f6;
          }
          
          #groups-assignment {
            background: #065f46 !important;
            border: 2px solid #10b981;
          }
          
          .groups-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
          }
          
          .group-container {
            background: #374151;
            border-radius: 8px;
            padding: 12px;
            border: 2px solid #4b5563;
            min-height: 120px;
          }
          
          .group-header {
            text-align: center;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 12px;
            padding: 8px;
            background: #1f2937;
            border-radius: 6px;
            font-size: 14px;
          }
          
          .group-players {
            min-height: 80px;
            border: 2px dashed #6b7280;
            border-radius: 6px;
            padding: 8px;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .group-players:empty::after {
            content: 'Arrastra jugadores aquí';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #9ca3af;
            font-size: 12px;
            font-style: italic;
            pointer-events: none;
          }
          
          .group-players.drop-zone-active:empty::after {
            color: #10b981;
            font-weight: bold;
          }
          
          .group-players.drag-over {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.2);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
            transform: scale(1.02);
          }
          
          .group-players.drop-zone-active {
            border-style: solid;
            border-color: #6b7280;
            animation: pulse-border 2s infinite;
          }
          
          @keyframes pulse-border {
            0%, 100% { border-color: #6b7280; }
            50% { border-color: #10b981; }
          }
          
          .group-player-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: #1f2937;
            border-radius: 4px;
            margin-bottom: 6px;
            font-size: 12px;
            cursor: move;
            border: 1px solid #374151;
            transition: all 0.2s ease;
          }
          
          .group-player-item:hover {
            background: #4b5563;
            border-color: #10b981;
          }
          
          .group-player-item.dragging {
            opacity: 0.8;
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            border-color: #10b981;
            background: #4b5563;
            z-index: 1000;
            position: relative;
          }
          
          .group-player-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
          }
          
          .group-player-info {
            flex: 1;
            min-width: 0;
          }
          
          .group-player-name {
            font-weight: 500;
            color: #f9fafb;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .group-player-rank {
            color: #9ca3af;
            font-size: 10px;
          }
          
          .unassigned-players {
            background: #7c2d12;
            border: 2px solid #dc2626;
          }
          
          .unassigned-players .group-header {
            background: #991b1b;
            color: #fecaca;
          }
          
          .groups-summary {
            margin-top: 16px;
            padding: 12px;
            background: #1f2937;
            border-radius: 8px;
            border: 1px solid #374151;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
          }
          
          .summary-row:last-child {
            margin-bottom: 0;
          }
          
          .summary-label {
            color: #9ca3af;
          }
          
          .summary-value {
            color: #10b981;
            font-weight: bold;
          }
          
          .distribute-button {
            width: 100%;
            padding: 10px;
            background: #059669;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 12px;
            transition: background 0.2s ease;
          }
          
          .distribute-button:hover {
            background: #047857;
          }
          
          .clear-groups-button {
            width: 100%;
            padding: 8px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            margin-top: 8px;
            transition: background 0.2s ease;
          }
          
          .clear-groups-button:hover {
            background: #b91c1c;
          }
        </style>
        <div class="responsive-tournament-form">
          <div class="form-group">
            <label for="name">🎾 Nombre del Torneo *</label>
            <input 
              id="name" 
              class="form-input" 
              placeholder="Ej: Copa de Verano 2024"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="description">📄 Descripción</label>
            <textarea 
              id="description" 
              class="form-textarea" 
              placeholder="Describe tu torneo aquí..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">🚀 Fecha de Inicio *</label>
              <input 
                id="startDate" 
                type="date" 
                class="form-input"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="endDate">🏁 Fecha de Fin *</label>
              <input 
                id="endDate" 
                type="date" 
                class="form-input"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="registrationDeadline">⏰ Fecha Límite de Inscripción *</label>
            <input 
              id="registrationDeadline" 
              type="date" 
              class="form-input"
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="tournamentType">🎯 Tipo de Torneo *</label>
              <select id="tournamentType" class="form-select" required onchange="toggleRoundRobinOptions()">
                <option value="">Seleccionar tipo...</option>
                <option value="single_elimination">🥊 Eliminación Directa</option>
                <option value="round_robin">🔄 Round Robin</option>
                <option value="swiss">🇨🇭 Sistema Suizo</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="maxPlayers">👥 Máximo de Jugadores *</label>
              <input 
                id="maxPlayers" 
                type="number" 
                class="form-input" 
                min="2" 
                max="128" 
                value="16"
                required
                onchange="updateGroupsBasedOnPlayers()"
              >
            </div>
          </div>
          
          <!-- Round Robin Group Configuration -->
          <div id="round-robin-config" class="form-group" style="display: none;">
            <label for="numberOfGroups">🏟️ Cantidad de Grupos *</label>
            <select id="numberOfGroups" class="form-select" onchange="updateGroupStructure()">
              <option value="2">2 Grupos</option>
              <option value="3">3 Grupos</option>
              <option value="4" selected>4 Grupos</option>
              <option value="6">6 Grupos</option>
              <option value="8">8 Grupos</option>
            </select>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
              💡 El número ideal de grupos depende del total de jugadores. Se recomienda 3-6 jugadores por grupo.
            </p>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="entryFee">💳 Cuota de Inscripción</label>
              <input 
                id="entryFee" 
                type="number" 
                class="form-input" 
                min="0" 
                placeholder="0"
              >
            </div>
            
            <div class="form-group">
              <label for="prizePool">🏆 Premio Total</label>
              <input 
                id="prizePool" 
                type="number" 
                class="form-input" 
                min="0" 
                placeholder="0"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="location">🏢 Ubicación</label>
            <input 
              id="location" 
              class="form-input" 
              placeholder="Ej: Club de Tenis Central"
            >
          </div>
          
          <div class="form-group">
            <label for="rules">📜 Reglas Específicas</label>
            <textarea 
              id="rules" 
              class="form-textarea" 
              placeholder="Reglas específicas del torneo..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="selectedPlayers">👥 Seleccionar Jugadores</label>
            <div class="players-dropdown">
              <div class="players-dropdown-trigger" onclick="togglePlayersDropdown()">
                <span id="dropdown-text">Seleccionar jugadores...</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="selected-count" class="selected-players-count" style="display: none;">0</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
              <div id="players-dropdown-content" class="players-dropdown-content">
                ${availablePlayers
                  .map(
                    (player) => `
                  <div class="player-item" onclick="togglePlayerSelection('${
                    player.id
                  }', event)">
                    <input 
                      type="checkbox" 
                      class="player-checkbox" 
                      id="player-${player.id}"
                      data-player-id="${player.id}"
                      data-player-name="${player.name}"
                      data-player-avatar="${
                        player.avatar_url || "/placeholder-user.jpg"
                      }"
                      data-player-ranking="${player.ranking || "N/A"}"
                      data-player-points="${player.points || 0}"
                      onclick="event.stopPropagation()"
                      onchange="updatePlayerSelection()"
                    >
                    <div class="player-info">
                      <img 
                        src="${player.avatar_url || "/placeholder-user.jpg"}" 
                        alt="${player.name}" 
                        class="player-avatar"
                        onerror="this.src='/placeholder-user.jpg'"
                      >
                      <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-rank">#${
                          player.ranking || "N/A"
                        } • ${player.points || 0} pts</div>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
              Opcional: Puedes pre-inscribir jugadores al torneo o dejar que se inscriban después
            </p>
          </div>
          
          <!-- Round Robin Groups Assignment -->
          <div id="groups-assignment" class="form-group" style="display: none;">
            <label>🏆 Asignación Manual de Grupos</label>
            <div id="groups-container">
              <!-- Los grupos se generarán dinámicamente aquí -->
            </div>
            <div style="margin-top: 12px; padding: 12px; background: #1e40af; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 12px;">
                💡 <strong>Instrucciones:</strong> Arrastra jugadores de la lista "Sin Grupo" a los grupos que desees. Los jugadores se distribuirán automáticamente si no los asignas manualmente.
              </p>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "🚀 Crear Torneo",
      cancelButtonText: "❌ Cancelar",
      background: "#1f2937",
      color: "#f9fafb",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "responsive-modal",
      },
      didOpen: () => {
        // Definir funciones para el dropdown de jugadores
        window.togglePlayersDropdown = function () {
          const content = document.getElementById("players-dropdown-content");
          const arrow = document.querySelector(".dropdown-arrow");

          if (content && arrow) {
            content.classList.toggle("show");
            arrow.classList.toggle("rotated");
          }
        };

        window.togglePlayerSelection = function (playerId, event) {
          event.stopPropagation();
          const checkbox = document.getElementById("player-" + playerId);
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            window.updatePlayerSelection();
          }
        };

        window.updatePlayerSelection = function () {
          const checkboxes = document.querySelectorAll(".player-checkbox");
          const selectedCount = Array.from(checkboxes).filter(
            (cb) => cb.checked
          ).length;
          const countElement = document.getElementById("selected-count");
          const textElement = document.getElementById("dropdown-text");

          if (countElement && textElement) {
            if (selectedCount > 0) {
              countElement.style.display = "inline";
              countElement.textContent = selectedCount;
              textElement.textContent =
                selectedCount === 1
                  ? "1 jugador seleccionado"
                  : selectedCount + " jugadores seleccionados";
            } else {
              countElement.style.display = "none";
              textElement.textContent = "Seleccionar jugadores...";
            }
          }
        };

        // Cerrar dropdown al hacer click fuera
        const handleClickOutside = function (event) {
          const dropdown = document.querySelector(".players-dropdown");
          if (dropdown && !dropdown.contains(event.target)) {
            const content = document.getElementById("players-dropdown-content");
            const arrow = document.querySelector(".dropdown-arrow");
            if (content && arrow) {
              content.classList.remove("show");
              arrow.classList.remove("rotated");
            }
          }
        };

        document.addEventListener("click", handleClickOutside);

        // Funciones para Round Robin Groups
        window.toggleRoundRobinOptions = function () {
          const tournamentType =
            document.getElementById("tournamentType").value;
          const roundRobinConfig =
            document.getElementById("round-robin-config");
          const groupsAssignment = document.getElementById("groups-assignment");
          const maxPlayersInput = document.getElementById("maxPlayers");
          const maxPlayersLabel = document.querySelector(
            'label[for="maxPlayers"]'
          );

          if (tournamentType === "round_robin") {
            // Mostrar configuración de Round Robin
            roundRobinConfig.style.display = "block";
            groupsAssignment.style.display = "block";

            // Cambiar el input y label de "Máximo de Jugadores" a "Jugadores por Grupo"
            if (maxPlayersLabel) {
              maxPlayersLabel.innerHTML = "👥 Jugadores por Grupo *";
            }
            if (maxPlayersInput) {
              maxPlayersInput.value = "4"; // Valor por defecto para jugadores por grupo
              maxPlayersInput.min = "3";
              maxPlayersInput.max = "8";
              maxPlayersInput.placeholder = "Ej: 4 jugadores por grupo";
            }

            // Actualizar estructura de grupos (mantener jugadores seleccionados)
            window.updateGroupStructure();

            console.log(
              "Switched to Round Robin mode - players per group input activated"
            );
          } else {
            // Ocultar configuración de Round Robin
            roundRobinConfig.style.display = "none";
            groupsAssignment.style.display = "none";

            // Restaurar el input y label original
            if (maxPlayersLabel) {
              maxPlayersLabel.innerHTML = "👥 Máximo de Jugadores *";
            }
            if (maxPlayersInput) {
              maxPlayersInput.value = "16"; // Valor por defecto para máximo de jugadores
              maxPlayersInput.min = "2";
              maxPlayersInput.max = "128";
              maxPlayersInput.placeholder = "";
            }

            console.log(
              "Switched to other tournament type - max players input restored"
            );
          }
        };

        // Función para deseleccionar todos los jugadores
        window.deselectAllPlayers = function () {
          const playerCheckboxes =
            document.querySelectorAll(".player-checkbox");
          playerCheckboxes.forEach((checkbox) => {
            if (checkbox.checked) {
              checkbox.checked = false;
            }
          });

          // Actualizar la visualización del dropdown
          window.updatePlayerSelection();

          // Limpiar todos los grupos existentes
          document.querySelectorAll(".group-player-item").forEach((item) => {
            item.remove();
          });

          console.log("All players deselected and groups cleared");
        };

        window.updateGroupsBasedOnPlayers = function () {
          const tournamentType =
            document.getElementById("tournamentType").value;
          if (tournamentType === "round_robin") {
            window.updateGroupStructure();
          }
        };

        window.updateGroupStructure = function () {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          const playersPerGroup =
            parseInt(document.getElementById("maxPlayers").value) || 4;
          const totalPlayers = numberOfGroups * playersPerGroup;
          const groupsContainer = document.getElementById("groups-container");

          if (!groupsContainer) return;

          let groupsHTML = '<div class="groups-grid">';

          // Crear grupos
          for (let i = 1; i <= numberOfGroups; i++) {
            groupsHTML += `
              <div class="group-container" id="group-${i}">
                <div class="group-header">Grupo ${i} <span style="font-size: 11px; color: #9ca3af;">(0/${playersPerGroup})</span></div>
                <div class="group-players" 
                     ondrop="dropHandler(event, ${i})" 
                     ondragover="dragOverHandler(event)"
                     ondragleave="dragLeaveHandler(event)"
                     data-max-players="${playersPerGroup}">
                  <!-- Jugadores del grupo -->
                </div>
              </div>
            `;
          }

          // Agregar contenedor para jugadores disponibles
          groupsHTML += `
            <div class="group-container unassigned-players" id="group-unassigned">
              <div class="group-header">🎯 Jugadores Disponibles</div>
              <div class="group-players" 
                   ondrop="dropHandler(event, 'unassigned')" 
                   ondragover="dragOverHandler(event)"
                   ondragleave="dragLeaveHandler(event)">
                <!-- Jugadores disponibles para asignar -->
              </div>
            </div>
          `;

          groupsHTML += "</div>";

          // Agregar botones y resumen
          groupsHTML += `
            <div class="groups-summary">
              <div class="summary-row">
                <span class="summary-label">Jugadores por grupo:</span>
                <span class="summary-value">${playersPerGroup} jugadores</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total de grupos:</span>
                <span class="summary-value">${numberOfGroups}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total de jugadores necesarios:</span>
                <span class="summary-value">${totalPlayers} jugadores</span>
              </div>
            </div>
            <button type="button" class="distribute-button" onclick="distributePlayersRandomly()">
              🎲 Repartir Aleatoriamente
            </button>
            <button type="button" class="clear-groups-button" onclick="clearAllGroups()">
              🗑️ Limpiar Grupos
            </button>
            <div style="margin-top: 12px; padding: 12px; background: #1e40af; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 12px;">
                💡 <strong>Instrucciones:</strong> Selecciona jugadores en la lista de arriba. Luego usa "Repartir Aleatoriamente" o arrastra manualmente a los grupos.
              </p>
            </div>
          `;

          groupsContainer.innerHTML = groupsHTML;

          // Poblar jugadores seleccionados en el área "Jugadores Disponibles"
          setTimeout(() => {
            window.populateUnassignedPlayers();
          }, 50);
        };

        window.populateUnassignedPlayers = function () {
          const selectedCheckboxes = document.querySelectorAll(
            ".player-checkbox:checked"
          );
          const unassignedContainer = document.querySelector(
            "#group-unassigned .group-players"
          );

          if (!unassignedContainer) return;

          // Obtener IDs de jugadores ya existentes en todos los grupos
          const existingPlayerIds = new Set();
          document.querySelectorAll(".group-player-item").forEach((item) => {
            existingPlayerIds.add(item.dataset.playerId);
          });

          // Solo agregar jugadores que están seleccionados pero no existen en ningún grupo
          selectedCheckboxes.forEach((checkbox) => {
            const playerId = checkbox.dataset.playerId;

            // Skip si el jugador ya existe en algún grupo
            if (existingPlayerIds.has(playerId)) {
              return;
            }

            const playerName = checkbox.dataset.playerName;
            const playerAvatar = checkbox.dataset.playerAvatar;
            const playerRanking = checkbox.dataset.playerRanking;
            const playerPoints = checkbox.dataset.playerPoints;

            const playerItem = document.createElement("div");
            playerItem.className = "group-player-item";
            playerItem.draggable = true;
            playerItem.dataset.playerId = playerId;
            playerItem.ondragstart = function (e) {
              window.dragStartHandler(e, playerId);
            };
            playerItem.ondragend = function (e) {
              window.dragEndHandler(e);
            };

            playerItem.innerHTML = `
              <img src="${playerAvatar}" alt="${playerName}" class="group-player-avatar" onerror="this.src='/placeholder-user.jpg'">
              <div class="group-player-info">
                <div class="group-player-name">${playerName}</div>
                <div class="group-player-rank">#${playerRanking} • ${playerPoints} pts</div>
              </div>
            `;

            unassignedContainer.appendChild(playerItem);
          });

          // Remover jugadores que fueron deseleccionados
          const selectedPlayerIds = new Set(
            Array.from(selectedCheckboxes).map((cb) => cb.dataset.playerId)
          );
          document.querySelectorAll(".group-player-item").forEach((item) => {
            const playerId = item.dataset.playerId;
            if (!selectedPlayerIds.has(playerId)) {
              item.remove();
            }
          });
        };

        // Funciones de Drag & Drop mejoradas
        window.dragStartHandler = function (ev, playerId) {
          console.log("Drag started for player:", playerId);
          ev.dataTransfer.setData("text/plain", playerId);
          ev.dataTransfer.effectAllowed = "move";
          ev.target.classList.add("dragging");

          // Agregar clase visual a todos los contenedores de grupos
          document.querySelectorAll(".group-players").forEach((container) => {
            container.classList.add("drop-zone-active");
          });
        };

        window.dragEndHandler = function (ev) {
          ev.target.classList.remove("dragging");

          // Remover clase visual de todos los contenedores
          document.querySelectorAll(".group-players").forEach((container) => {
            container.classList.remove("drop-zone-active", "drag-over");
          });
        };

        window.dragOverHandler = function (ev) {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "move";

          // Encontrar el contenedor correcto (.group-players)
          let target = ev.target;
          while (target && !target.classList.contains("group-players")) {
            target = target.parentElement;
          }

          if (target && target.classList.contains("group-players")) {
            target.classList.add("drag-over");
          }
        };

        window.dragLeaveHandler = function (ev) {
          // Solo remover si realmente estamos saliendo del contenedor
          let target = ev.target;
          while (target && !target.classList.contains("group-players")) {
            target = target.parentElement;
          }

          if (
            target &&
            target.classList.contains("group-players") &&
            !target.contains(ev.relatedTarget)
          ) {
            target.classList.remove("drag-over");
          }
        };

        window.dropHandler = function (ev, groupId) {
          ev.preventDefault();
          console.log("Drop event triggered for group:", groupId);

          // Encontrar el contenedor correcto
          let target = ev.target;
          while (target && !target.classList.contains("group-players")) {
            target = target.parentElement;
          }

          if (target) {
            target.classList.remove("drag-over");
          }

          const playerId = ev.dataTransfer.getData("text/plain");
          console.log("Moving player:", playerId, "to group:", groupId);

          const draggedElement = document.querySelector(
            `[data-player-id="${playerId}"].group-player-item`
          );

          if (draggedElement) {
            // Encontrar el contenedor de destino
            const targetGroup =
              groupId === "unassigned"
                ? document.querySelector("#group-unassigned .group-players")
                : document.querySelector(`#group-${groupId} .group-players`);

            if (targetGroup) {
              // Verificar límite de jugadores por grupo (solo para grupos numerados)
              if (groupId !== "unassigned") {
                const maxPlayers =
                  parseInt(targetGroup.dataset.maxPlayers) || 4;
                const currentPlayers =
                  targetGroup.querySelectorAll(".group-player-item").length;

                if (currentPlayers >= maxPlayers) {
                  alert(
                    `El Grupo ${groupId} ya tiene el máximo de ${maxPlayers} jugadores.`
                  );
                  return;
                }
              }

              // Remover el elemento del grupo anterior
              draggedElement.remove();

              // Agregar al nuevo grupo
              draggedElement.classList.remove("dragging");
              targetGroup.appendChild(draggedElement);

              // Actualizar contadores
              window.updateGroupCounters();

              console.log("Player moved successfully to:", groupId);
            } else {
              console.error("Target group not found:", groupId);
            }
          } else {
            console.error("Dragged element not found:", playerId);
          }

          // Limpiar clases visuales
          document.querySelectorAll(".group-players").forEach((container) => {
            container.classList.remove("drop-zone-active", "drag-over");
          });
        };

        // Nueva función para repartir aleatoriamente con lógica Round Robin
        window.distributePlayersRandomly = function () {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          const playersPerGroup =
            parseInt(document.getElementById("maxPlayers").value) || 4;
          const unassignedPlayers = Array.from(
            document.querySelectorAll("#group-unassigned .group-player-item")
          );

          console.log("Starting random distribution:", {
            groups: numberOfGroups,
            playersPerGroup: playersPerGroup,
            availablePlayers: unassignedPlayers.length,
          });

          // Limpiar todos los grupos primero
          for (let i = 1; i <= numberOfGroups; i++) {
            const groupContainer = document.querySelector(
              `#group-${i} .group-players`
            );
            if (groupContainer) {
              groupContainer.innerHTML = "";
            }
          }

          // Verificar si hay suficientes jugadores
          const totalNeeded = numberOfGroups * playersPerGroup;
          if (unassignedPlayers.length < totalNeeded) {
            alert(
              `Se necesitan ${totalNeeded} jugadores para llenar todos los grupos (${playersPerGroup} por grupo). Solo hay ${unassignedPlayers.length} seleccionados.`
            );
            return;
          }

          // Crear copia aleatoria de los jugadores
          const shuffledPlayers = [...unassignedPlayers];
          for (let i = shuffledPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlayers[i], shuffledPlayers[j]] = [
              shuffledPlayers[j],
              shuffledPlayers[i],
            ];
          }

          // Distribuir jugadores aleatoriamente
          let playerIndex = 0;
          for (let groupNum = 1; groupNum <= numberOfGroups; groupNum++) {
            const targetGroup = document.querySelector(
              `#group-${groupNum} .group-players`
            );

            if (targetGroup) {
              // Agregar jugadores al grupo hasta el límite
              for (
                let j = 0;
                j < playersPerGroup && playerIndex < shuffledPlayers.length;
                j++
              ) {
                const player = shuffledPlayers[playerIndex];
                if (player && player.parentNode) {
                  player.remove();
                  targetGroup.appendChild(player);
                  playerIndex++;
                }
              }
            }
          }

          // Actualizar contadores de grupos
          window.updateGroupCounters();

          console.log(
            "Players distributed randomly. Used",
            playerIndex,
            "players."
          );
        };

        // Función para actualizar contadores de jugadores en grupos
        window.updateGroupCounters = function () {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          const playersPerGroup =
            parseInt(document.getElementById("maxPlayers").value) || 4;

          for (let i = 1; i <= numberOfGroups; i++) {
            const groupContainer = document.querySelector(`#group-${i}`);
            const groupPlayers = document.querySelectorAll(
              `#group-${i} .group-player-item`
            );
            const header = groupContainer?.querySelector(".group-header");

            if (header) {
              const currentCount = groupPlayers.length;
              const groupName = `Grupo ${i}`;
              const countInfo = `<span style="font-size: 11px; color: ${
                currentCount === playersPerGroup ? "#10b981" : "#9ca3af"
              };">(${currentCount}/${playersPerGroup})</span>`;
              header.innerHTML = `${groupName} ${countInfo}`;
            }
          }
        };

        window.clearAllGroups = function () {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          const unassignedContainer = document.querySelector(
            "#group-unassigned .group-players"
          );

          if (!unassignedContainer) return;

          // Mover todos los jugadores de vuelta a "Sin Grupo"
          for (let i = 1; i <= numberOfGroups; i++) {
            const groupPlayers = Array.from(
              document.querySelectorAll(`#group-${i} .group-player-item`)
            );
            groupPlayers.forEach((player) => {
              if (player.parentNode) {
                player.remove();
                unassignedContainer.appendChild(player);
              }
            });
          }

          console.log("All players moved back to unassigned group");
        };

        // Actualizar la función updatePlayerSelection para integrar con grupos
        const originalUpdatePlayerSelection = window.updatePlayerSelection;
        window.updatePlayerSelection = function () {
          originalUpdatePlayerSelection();

          // Si es Round Robin y los grupos están visibles, actualizar jugadores sin grupo
          const tournamentType =
            document.getElementById("tournamentType").value;
          if (tournamentType === "round_robin") {
            // Usar un pequeño delay para evitar conflictos con el DOM
            setTimeout(() => {
              window.populateUnassignedPlayers();
            }, 50);
          }
        };

        // Función mejorada para sincronizar grupos cuando se actualiza la estructura
        window.syncGroupsWithSelection = function () {
          const tournamentType =
            document.getElementById("tournamentType").value;
          if (tournamentType === "round_robin") {
            // Solo poblar si los grupos están visibles
            const groupsContainer = document.getElementById("groups-container");
            if (groupsContainer && groupsContainer.innerHTML.trim() !== "") {
              window.populateUnassignedPlayers();
            }
          }
        };

        // Limpiar event listener cuando se cierre el modal
        const modal = document.querySelector(".swal2-container");
        if (modal) {
          modal.addEventListener("DOMNodeRemoved", function () {
            document.removeEventListener("click", handleClickOutside);
            delete window.togglePlayersDropdown;
            delete window.togglePlayerSelection;
            delete window.updatePlayerSelection;
            delete window.toggleRoundRobinOptions;
            delete window.updateGroupsBasedOnPlayers;
            delete window.updateGroupStructure;
            delete window.populateUnassignedPlayers;
            delete window.syncGroupsWithSelection;
            delete window.dragStartHandler;
            delete window.dragEndHandler;
            delete window.dragOverHandler;
            delete window.dragLeaveHandler;
            delete window.dropHandler;
            delete window.distributePlayersRandomly;
            delete window.updateGroupCounters;
            delete window.clearAllGroups;
            delete window.deselectAllPlayers;
          });
        }
      },
      preConfirm: () => {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const registrationDeadline = document.getElementById(
          "registrationDeadline"
        ).value;
        const tournamentType = document.getElementById("tournamentType").value;
        const maxPlayers = parseInt(
          document.getElementById("maxPlayers").value
        );
        const entryFee =
          parseFloat(document.getElementById("entryFee").value) || 0;
        const prizePool =
          parseFloat(document.getElementById("prizePool").value) || 0;
        const location = document.getElementById("location").value;
        const rules = document.getElementById("rules").value;

        // Obtener jugadores seleccionados
        const selectedPlayerCheckboxes = document.querySelectorAll(
          ".player-checkbox:checked"
        );
        const selectedPlayers = Array.from(selectedPlayerCheckboxes).map(
          (cb) => cb.dataset.playerId
        );
        
        console.log("📋 JUGADORES SELECCIONADOS EN DOM:", {
          checkboxes: selectedPlayerCheckboxes?.length || 0,
          playerIds: selectedPlayers || [],
          checkboxElements: selectedPlayerCheckboxes ? Array.from(selectedPlayerCheckboxes).map(cb => ({
            id: cb?.id || 'unknown',
            playerId: cb?.dataset?.playerId || 'unknown',
            playerName: cb?.dataset?.playerName || 'unknown',
            checked: cb?.checked || false
          })) : []
        });

        // Obtener información de grupos para Round Robin
        let groupsData = null;
        if (tournamentType === "round_robin") {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          groupsData = {
            numberOfGroups: numberOfGroups,
            groups: {},
          };

          // Extraer jugadores de cada grupo
          for (let i = 1; i <= numberOfGroups; i++) {
            const groupPlayers = document.querySelectorAll(
              `#group-${i} .group-player-item`
            );
            groupsData.groups[`grupo_${i}`] = Array.from(groupPlayers).map(
              (player) => player.dataset.playerId
            );
          }

          // Jugadores sin asignar
          const unassignedPlayers = document.querySelectorAll(
            "#group-unassigned .group-player-item"
          );
          groupsData.groups["sin_grupo"] = Array.from(unassignedPlayers).map(
            (player) => player.dataset.playerId
          );
        }

        if (
          !name ||
          !startDate ||
          !endDate ||
          !registrationDeadline ||
          !tournamentType
        ) {
          Swal.showValidationMessage(
            "Por favor completa todos los campos obligatorios"
          );
          return false;
        }

        if (new Date(startDate) <= new Date()) {
          Swal.showValidationMessage("La fecha de inicio debe ser futura");
          return false;
        }

        if (new Date(endDate) <= new Date(startDate)) {
          Swal.showValidationMessage(
            "La fecha de fin debe ser posterior a la fecha de inicio"
          );
          return false;
        }

        if (new Date(registrationDeadline) >= new Date(startDate)) {
          Swal.showValidationMessage(
            "La fecha límite de inscripción debe ser anterior al inicio"
          );
          return false;
        }

        if (maxPlayers < 2 || maxPlayers > 128) {
          Swal.showValidationMessage(
            "El número de jugadores debe estar entre 2 y 128"
          );
          return false;
        }

        // Validar potencia de 2 para eliminación directa
        if (
          tournamentType === "single_elimination" &&
          (maxPlayers & (maxPlayers - 1)) !== 0
        ) {
          Swal.showValidationMessage(
            "Para eliminación directa, el número de jugadores debe ser una potencia de 2 (2, 4, 8, 16, 32, 64, 128)"
          );
          return false;
        }

        // Validación diferente para Round Robin vs otros torneos
        if (tournamentType === "round_robin") {
          const numberOfGroups = parseInt(
            document.getElementById("numberOfGroups").value
          );
          const playersPerGroup = maxPlayers; // En Round Robin, maxPlayers es jugadores por grupo
          const totalNeeded = numberOfGroups * playersPerGroup;

          // Para Round Robin, validar que no exceda el total necesario
          if (selectedPlayers.length > totalNeeded) {
            Swal.showValidationMessage(
              `Has seleccionado ${selectedPlayers.length} jugadores, pero solo se necesitan ${totalNeeded} para ${numberOfGroups} grupos de ${playersPerGroup} jugadores cada uno.`
            );
            return false;
          }
        } else {
          // Validación normal para otros tipos de torneo
          if (selectedPlayers.length > maxPlayers) {
            Swal.showValidationMessage(
              "Has seleccionado " +
                selectedPlayers.length +
                " jugadores, pero el máximo permitido es " +
                maxPlayers
            );
            return false;
          }
        }

        // Calcular max_players correcto según el tipo de torneo
        let actualMaxPlayers = maxPlayers;
        if (tournamentType === "round_robin" && groupsData) {
          // En Round Robin, maxPlayers es jugadores por grupo, hay que calcular el total
          actualMaxPlayers = groupsData.numberOfGroups * maxPlayers;
        }

        return {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          registration_deadline: registrationDeadline,
          tournament_type: tournamentType,
          max_players: actualMaxPlayers,
          entry_fee: entryFee,
          prize_pool: prizePool,
          location,
          rules,
          status: "upcoming",
          selected_players: selectedPlayers,
          groups_data: groupsData,
          players_per_group:
            tournamentType === "round_robin" ? maxPlayers : null,
        };
      },
    });

    if (formData) {
      console.log("🎾 INICIANDO CREACIÓN DE TORNEO:", {
        formData: formData,
        selectedPlayers: formData?.selected_players || [],
        groupsData: formData?.groups_data || null,
        playerCount: (formData?.selected_players?.length) || 0
      });
      
      try {
        // Separar los jugadores seleccionados y datos de grupos del resto de datos
        const { selected_players, groups_data, ...tournamentData } = formData;

        // Si es Round Robin, agregar información de grupos al torneo
        if (tournamentData.tournament_type === "round_robin" && groups_data) {
          tournamentData.groups_config = {
            number_of_groups: groups_data.numberOfGroups,
            groups: groups_data.groups,
          };
        }

        // Crear el torneo
        const newTournament = await tournamentsAPI.create(tournamentData);
        console.log("Torneo creado:", newTournament);

        let successMessage = "Torneo creado correctamente";
        let registeredCount = 0;

        // Inscribir jugadores seleccionados en la base de datos
        if (selected_players && selected_players.length > 0) {
          try {
            console.log(
              "📥 INICIANDO INSCRIPCIÓN DE JUGADORES:",
              {
                tournamentId: newTournament.id,
                tournamentName: newTournament.name,
                selectedPlayers: selected_players,
                count: selected_players.length
              }
            );

            // Usar la API de registrations para inscribir jugadores
            const registrationResult = await tournamentRegistrationsAPI.registerPlayers(
              newTournament.id,
              selected_players
            );
            
            console.log("✅ JUGADORES INSCRITOS EXITOSAMENTE:", registrationResult);
            registeredCount = selected_players.length;

            // Mensaje específico para Round Robin con grupos
            if (
              tournamentData.tournament_type === "round_robin" &&
              groups_data
            ) {
              const totalAssignedPlayers = Object.values(groups_data.groups)
                .filter((groupPlayers) => Array.isArray(groupPlayers))
                .reduce(
                  (total, groupPlayers) => total + groupPlayers.length,
                  0
                );

              if (totalAssignedPlayers > 0) {
                successMessage = `🎾 Torneo Round Robin creado exitosamente:\n\n✅ ${groups_data.numberOfGroups} grupos configurados\n✅ ${registeredCount} jugadores inscritos en la base de datos\n✅ ${totalAssignedPlayers} jugadores asignados a grupos específicos`;
              } else {
                successMessage = `🎾 Torneo Round Robin creado con:\n\n✅ ${groups_data.numberOfGroups} grupos configurados\n✅ ${registeredCount} jugadores inscritos`;
              }
            } else {
              // Mensaje para otros tipos de torneo
              successMessage = `🎾 Torneo creado exitosamente con ${registeredCount} jugador${
                registeredCount === 1 ? "" : "es"
              } inscrito${
                registeredCount === 1 ? "" : "s"
              } en la base de datos`;
            }
          } catch (registerError) {
            console.error(
              "❌ ERROR CRITICO INSCRIBIENDO JUGADORES:",
              {
                error: registerError,
                message: registerError.message,
                code: registerError.code,
                details: registerError.details,
                tournamentId: newTournament.id,
                selectedPlayers: selected_players
              }
            );

            // Mensaje de error más específico
            let errorDetail = registerError.message || "Error desconocido";
            if (errorDetail.includes('tournament_registrations')) {
              errorDetail =
                "La tabla de inscripciones no existe. Necesitas crearla en Supabase.";
            } else if (errorDetail.includes('permission denied')) {
              errorDetail = "Sin permisos para inscribir jugadores. Configura las políticas RLS en Supabase.";
            } else if (errorDetail.includes('violates unique constraint')) {
              errorDetail = "Algunos jugadores ya están inscritos en este torneo.";
            }

            successMessage = `⚠️ Torneo creado correctamente, pero hubo un problema al inscribir jugadores:\n\n❌ ${errorDetail}\n\n💡 Los jugadores pueden inscribirse manualmente más tarde usando "Inscribir Jugadores".`;
          }
        } else {
          // Mensaje cuando no hay jugadores seleccionados
          if (tournamentData.tournament_type === "round_robin" && groups_data) {
            successMessage = `🎾 Torneo Round Robin creado con ${groups_data.numberOfGroups} grupos configurados. Los jugadores pueden inscribirse después.`;
          } else {
            successMessage =
              "Torneo creado correctamente. Los jugadores pueden inscribirse después.";
          }
        }

        await Swal.fire({
          title: "🎉 ¡Éxito!",
          html: `
            <div style="text-align: left; padding: 1rem; line-height: 1.6;">
              ${successMessage.replace(/\n/g, "<br>")}
            </div>
            ${
              registeredCount > 0
                ? `
              <div style="margin-top: 1rem; padding: 1rem; background: #065f46; border-radius: 8px;">
                <p style="margin: 0; color: #6ee7b7; font-size: 14px;">
                  💾 <strong>Base de Datos:</strong> Los jugadores fueron guardados exitosamente en la tabla 'tournament_registrations'
                </p>
              </div>
            `
                : ""
            }
          `,
          icon: registeredCount > 0 ? "success" : "info",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonColor: "#10b981",
          width: "clamp(320px, 90vw, 600px)",
        });

        // Recargar torneos
        await loadTournaments();
      } catch (error) {
        console.error("Error creando torneo:", error);

        let errorMessage =
          error.message || "Error desconocido al crear el torneo";

        // Mensajes de error más user-friendly
        if (errorMessage.includes('tabla "tournaments" no existe')) {
          errorMessage =
            '❌ La tabla de torneos no existe en la base de datos.\n\n💡 Solución: Necesitas crear la tabla "tournaments" en Supabase con las columnas requeridas.';
        } else if (errorMessage.includes("Columna no encontrada")) {
          errorMessage =
            '❌ Falta una columna en la tabla de torneos.\n\n💡 Solución: Verifica que la tabla "tournaments" tenga todas las columnas necesarias.';
        }

        Swal.fire({
          title: "❌ Error al Crear Torneo",
          html: `
            <div style="text-align: left; padding: 1rem; background: #374151; border-radius: 8px; margin: 1rem 0;">
              <p style="margin: 0; color: #f9fafb; line-height: 1.5;">${errorMessage}</p>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #1e3a8a; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 0.9rem;">
                <strong>📋 Información técnica:</strong><br>
                Revisa la consola del navegador (F12) para más detalles específicos del error.
              </p>
            </div>
          `,
          icon: "error",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonText: "🔍 Entendido",
          confirmButtonColor: "#ef4444",
          width: "600px",
        });
      }
    }
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  // Función para obtener el progreso del torneo
  const getTournamentProgress = (tournament) => {
    // Por ahora retornamos un valor mock, esto debería calcularse basado en matches
    return Math.floor(Math.random() * 100);
  };

  // Función para obtener la ronda actual
  const getCurrentRound = (tournament) => {
    // Por ahora retornamos valores mock, esto debería calcularse basado en matches
    const rounds = {
      single_elimination: [
        "Primera Ronda",
        "Octavos",
        "Cuartos",
        "Semifinales",
        "Final",
      ],
      round_robin: ["Fase de Grupos"],
      swiss: ["Ronda Suiza"],
    };
    return rounds[tournament.tournament_type]?.[0] || "En Progreso";
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status) => {
    const colors = {
      upcoming: "bg-blue-500",
      ongoing: "bg-green-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (status) => {
    const texts = {
      upcoming: "Próximo",
      ongoing: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  // Función para obtener el texto del tipo de torneo en español
  const getTournamentTypeText = (type) => {
    const types = {
      single_elimination: "Eliminación Directa",
      round_robin: "Round Robin",
      swiss: "Sistema Suizo",
    };
    return types[type] || type;
  };

  // Función para cambiar el estado del torneo
  const changeTournamentStatus = async (tournament, newStatus) => {
    try {
      // Validaciones según el estado
      if (newStatus === "ongoing" && tournament.status !== "upcoming") {
        throw new Error(
          'Solo se pueden iniciar torneos que estén en estado "Próximo"'
        );
      }

      if (newStatus === "completed" && tournament.status !== "ongoing") {
        throw new Error(
          'Solo se pueden completar torneos que estén "En Progreso"'
        );
      }

      // Si se está iniciando el torneo, verificar que haya jugadores inscritos
      if (newStatus === "ongoing") {
        const registeredPlayers =
          await tournamentRegistrationsAPI.getPlayersByTournament(
            tournament.id
          );
        if (registeredPlayers.length < 2) {
          throw new Error(
            "Se necesitan al menos 2 jugadores inscritos para iniciar el torneo"
          );
        }
      }

      // Actualizar estado en la base de datos
      await tournamentsAPI.update(tournament.id, { status: newStatus });

      // Mensaje de éxito
      const statusMessages = {
        upcoming: "reprogramado como próximo",
        ongoing: "iniciado correctamente",
        completed: "marcado como completado",
        cancelled: "cancelado",
      };

      await Swal.fire({
        title: "✅ Estado Actualizado",
        text: `El torneo "${tournament.name}" ha sido ${statusMessages[newStatus]}.`,
        icon: "success",
        background: "#1f2937",
        color: "#f9fafb",
        confirmButtonColor: "#10b981",
        confirmButtonText: "👍 Perfecto",
      });

      // Recargar torneos para actualizar la vista
      await loadTournaments();
    } catch (error) {
      console.error("Error cambiando estado del torneo:", error);

      Swal.fire({
        title: "❌ Error",
        text: error.message || "No se pudo cambiar el estado del torneo",
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Función para ver detalles del torneo
  const viewTournamentDetails = async (tournament) => {
    console.log(
      "🔍 Loading tournament details for:",
      tournament.name,
      "ID:",
      tournament.id
    );

    // Cargar jugadores inscritos
    let registeredPlayers = [];
    let registrationStats = { registered: 0, total: 0 };

    try {
      console.log("📋 Fetching registered players from database...");
      registeredPlayers =
        await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id);
      console.log("✅ Registered players loaded:", registeredPlayers);

      console.log("📊 Fetching registration stats...");
      registrationStats =
        await tournamentRegistrationsAPI.getTournamentRegistrationStats(
          tournament.id
        );
      console.log("✅ Registration stats loaded:", registrationStats);
    } catch (error) {
      console.error("❌ Error cargando jugadores inscritos:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });

      // Mostrar error específico en consola para debugging
      if (error.message.includes("tournament_registrations")) {
        console.warn(
          "⚠️ La tabla tournament_registrations no existe. Necesitas crearla en Supabase."
        );
      }
    }

    // Organizar jugadores por grupos si es Round Robin
    let organizedPlayers = { hasGroups: false, groups: [], unassignedPlayers: registeredPlayers };
    
    console.log("🔍 DEBUGGING TOURNAMENT DATA:", {
      tournamentType: tournament.tournament_type,
      hasGroupsConfig: !!tournament.groups_config,
      groupsConfig: tournament.groups_config,
      tournamentObject: tournament
    });
    
    if (tournament.tournament_type === 'round_robin') {
      console.log("🎯 Round Robin detected, checking for groups configuration...");
      
      if (tournament.groups_config) {
        console.log("🔧 Groups config found, organizing players into groups...");
        organizedPlayers = organizePlayersIntoGroups(tournament.groups_config, registeredPlayers);
        console.log("✅ Players organized into groups:", organizedPlayers);
      } else {
        console.log("⚠️ No groups_config found, creating default group structure...");
        // Crear estructura de grupos por defecto si no hay configuración
        const defaultGroupsConfig = {
          number_of_groups: Math.min(4, Math.ceil(registeredPlayers.length / 3)), // Máximo 4 grupos, mínimo 3 jugadores por grupo
          groups: {}
        };
        
        console.log("📋 Using default groups config:", defaultGroupsConfig);
        organizedPlayers = organizePlayersIntoGroups(defaultGroupsConfig, registeredPlayers);
        console.log("✅ Players organized into default groups:", organizedPlayers);
      }
    } else {
      console.log("🏁 Not a Round Robin tournament, using regular player list");
    }

    await Swal.fire({
      title: `<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">🏆 ${tournament.name}</span>`,
      html: `
        <style>
          .tournament-details-modal {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .details-section {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .details-section h4 {
            color: #10b981;
            font-size: clamp(14px, 3vw, 16px);
            font-weight: bold;
            margin: 0 0 clamp(8px, 2vw, 12px) 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(8px, 2vw, 12px);
          }
          @media (min-width: 640px) {
            .details-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
          .detail-item {
            background: #1f2937;
            padding: clamp(8px, 2vw, 12px);
            border-radius: 6px;
            border: 1px solid #4b5563;
          }
          .detail-label {
            font-size: clamp(11px, 2.2vw, 12px);
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .detail-value {
            font-size: clamp(14px, 3vw, 16px);
            color: #f9fafb;
            font-weight: 500;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-upcoming { background: #3b82f6; color: white; }
          .status-ongoing { background: #10b981; color: white; }
          .status-completed { background: #6b7280; color: white; }
          .status-cancelled { background: #ef4444; color: white; }
          .registered-players-section {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
          }
          .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: clamp(8px, 2vw, 12px);
            margin-top: 12px;
          }
          @media (max-width: 640px) {
            .players-grid {
              grid-template-columns: 1fr;
            }
          }
          
          /* Estilos para vista de grupos Round Robin */
          .groups-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: clamp(12px, 3vw, 16px);
            margin-top: 12px;
          }
          @media (max-width: 640px) {
            .groups-container {
              grid-template-columns: 1fr;
            }
          }
          
          .group-box {
            background: #1f2937;
            border: 2px solid #059669;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .group-box:hover {
            border-color: #10b981;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }
          
          .unassigned-group {
            border-color: #f59e0b;
          }
          .unassigned-group:hover {
            border-color: #fbbf24;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          }
          
          .group-header {
            background: linear-gradient(135deg, #059669, #10b981);
            padding: clamp(8px, 2vw, 10px);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .unassigned-group .group-header {
            background: linear-gradient(135deg, #f59e0b, #fbbf24);
            color: #1f2937;
          }
          
          .group-header h5 {
            margin: 0;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: bold;
            color: white;
          }
          .unassigned-group .group-header h5 {
            color: #1f2937;
          }
          
          .group-count {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: clamp(10px, 2vw, 11px);
            font-weight: 600;
            color: white;
          }
          .unassigned-group .group-count {
            background: rgba(31, 41, 55, 0.2);
            color: #1f2937;
          }
          
          .group-players {
            padding: clamp(6px, 1.5vw, 8px);
            max-height: 200px;
            overflow-y: auto;
          }
          
          .group-player-item {
            display: flex;
            align-items: center;
            padding: clamp(4px, 1vw, 6px) clamp(6px, 1.5vw, 8px);
            margin-bottom: 3px;
            background: #374151;
            border-radius: 6px;
            gap: clamp(6px, 1.5vw, 8px);
            transition: all 0.2s ease;
          }
          .group-player-item:last-child {
            margin-bottom: 0;
          }
          .group-player-item:hover {
            background: #4b5563;
            transform: translateX(2px);
          }
          
          .player-avatar-tiny {
            width: clamp(20px, 5vw, 24px);
            height: clamp(20px, 5vw, 24px);
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #10b981;
          }
          
          .player-name-only {
            font-size: clamp(11px, 2.5vw, 13px);
            font-weight: 500;
            color: #e5e7eb;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }
          
          .empty-group-message {
            text-align: center;
            padding: clamp(16px, 4vw, 20px);
            color: #9ca3af;
          }
          .player-card {
            background: #1f2937;
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: clamp(10px, 2.5vw, 12px);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s ease;
          }
          .player-card:hover {
            border-color: #10b981;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
          }
          .player-avatar-detail {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #10b981;
            flex-shrink: 0;
          }
          .player-info-detail {
            flex: 1;
            min-width: 0;
          }
          .player-name-detail {
            font-weight: 600;
            color: #f9fafb;
            font-size: clamp(13px, 3vw, 15px);
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .player-stats-detail {
            font-size: clamp(11px, 2.2vw, 12px);
            color: #9ca3af;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .player-stat-item {
            background: #374151;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
          .registration-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1f2937;
            padding: clamp(10px, 2.5vw, 12px);
            border-radius: 6px;
            border: 1px solid #059669;
          }
          .summary-item {
            text-align: center;
            flex: 1;
          }
          .summary-number {
            font-size: clamp(18px, 4vw, 22px);
            font-weight: bold;
            color: #10b981;
            margin-bottom: 2px;
          }
          .summary-label {
            font-size: clamp(10px, 2vw, 12px);
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-divider {
            width: 1px;
            height: 30px;
            background: #4b5563;
            margin: 0 8px;
          }
          .empty-players {
            text-align: center;
            padding: 30px 20px;
            color: #9ca3af;
            font-style: italic;
            background: #1f2937;
            border-radius: 8px;
            border: 2px dashed #4b5563;
          }
          .registration-date-badge {
            background: #1e3a8a;
            color: #93c5fd;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
          .status-editor {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #1f2937;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #4b5563;
            margin-top: 8px;
          }
          .status-select {
            background: #374151;
            color: #f9fafb;
            border: 1px solid #4b5563;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .status-select:hover {
            border-color: #10b981;
          }
          .status-select:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          }
          .status-action-buttons {
            display: flex;
            gap: 6px;
            margin-top: 8px;
          }
          .status-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-btn-start {
            background: #10b981;
            color: white;
          }
          .status-btn-start:hover {
            background: #059669;
            transform: translateY(-1px);
          }
          .status-btn-complete {
            background: #6b7280;
            color: white;
          }
          .status-btn-complete:hover {
            background: #4b5563;
            transform: translateY(-1px);
          }
          .status-btn-cancel {
            background: #ef4444;
            color: white;
          }
          .status-btn-cancel:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
          .status-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
          }
          .status-editor-label {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
        <div class="tournament-details-modal">
          <div class="details-section">
            <h4>📅 Información General</h4>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Estado</div>
                <div class="detail-value">
                  <span class="status-badge status-${tournament.status}">
                    ${getStatusText(tournament.status)}
                  </span>
                  <div class="status-editor">
                    <span class="status-editor-label">Cambiar Estado:</span>
                    <select id="status-select" class="status-select">
                      <option value="upcoming" ${
                        tournament.status === "upcoming" ? "selected" : ""
                      }>📅 Próximo</option>
                      <option value="ongoing" ${
                        tournament.status === "ongoing" ? "selected" : ""
                      }>⚡ En Progreso</option>
                      <option value="completed" ${
                        tournament.status === "completed" ? "selected" : ""
                      }>🏆 Completado</option>
                      <option value="cancelled" ${
                        tournament.status === "cancelled" ? "selected" : ""
                      }>❌ Cancelado</option>
                    </select>
                  </div>
                  <div class="status-action-buttons">
                    <button 
                      class="status-btn status-btn-start" 
                      onclick="handleStatusChange('ongoing')"
                      ${tournament.status !== "upcoming" ? "disabled" : ""}
                    >
                      🚀 Iniciar Torneo
                    </button>
                    <button 
                      class="status-btn status-btn-complete" 
                      onclick="handleStatusChange('completed')"
                      ${tournament.status !== "ongoing" ? "disabled" : ""}
                    >
                      🏁 Completar
                    </button>
                    <button 
                      class="status-btn status-btn-cancel" 
                      onclick="handleStatusChange('cancelled')"
                      ${tournament.status === "completed" ? "disabled" : ""}
                    >
                      🚫 Cancelar
                    </button>
                  </div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Tipo de Torneo</div>
                <div class="detail-value">${getTournamentTypeText(
                  tournament.tournament_type
                )}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha de Inicio</div>
                <div class="detail-value">${formatDate(
                  tournament.start_date
                )}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha de Fin</div>
                <div class="detail-value">${formatDate(
                  tournament.end_date
                )}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha Límite Inscripción</div>
                <div class="detail-value">${formatDate(
                  tournament.registration_deadline
                )}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Máximo de Jugadores</div>
                <div class="detail-value">${
                  tournament.max_players
                } jugadores</div>
              </div>
            </div>
          </div>

          <!-- Jugadores Inscritos -->
          <div class="registered-players-section">
            <h4>👥 Jugadores Inscritos</h4>
            <div class="registration-summary">
              <div class="summary-item">
                <div class="summary-number">${
                  registrationStats.registered
                }</div>
                <div class="summary-label">Inscritos</div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-item">
                <div class="summary-number">${tournament.max_players}</div>
                <div class="summary-label">Máximo</div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-item">
                <div class="summary-number">${
                  tournament.max_players - registrationStats.registered
                }</div>
                <div class="summary-label">Disponibles</div>
              </div>
            </div>
            
            ${
              registeredPlayers.length > 0
                ? organizedPlayers.hasGroups
                  ? `
                    <!-- Vista de grupos para Round Robin -->
                    <div class="groups-container">
                      ${organizedPlayers.groups
                        .map(
                          (group) => `
                        <div class="group-box">
                          <div class="group-header">
                            <h5>🏟️ ${group.name}</h5>
                            <span class="group-count">${group.players.length} jugador${group.players.length === 1 ? '' : 'es'}</span>
                          </div>
                          <div class="group-players">
                            ${group.players.length > 0
                              ? group.players
                                  .map(
                                    (player) => `
                                  <div class="group-player-item">
                                    <img 
                                      src="${player.avatar_url || "/placeholder-user.jpg"}" 
                                      alt="${player.name}" 
                                      class="player-avatar-tiny"
                                      onerror="this.src='/placeholder-user.jpg'"
                                    >
                                    <span class="player-name-only">${player.name}</span>
                                  </div>
                                `
                                  )
                                  .join("")
                              : `
                                <div class="empty-group-message">
                                  <span style="color: #9ca3af; font-style: italic; font-size: 14px;">
                                    📭 Grupo vacío
                                  </span>
                                </div>
                              `}
                          </div>
                        </div>
                      `
                        )
                        .join("")}
                      
                      ${organizedPlayers.unassignedPlayers.length > 0
                        ? `
                        <div class="group-box unassigned-group">
                          <div class="group-header">
                            <h5>📋 Sin Grupo</h5>
                            <span class="group-count">${organizedPlayers.unassignedPlayers.length} jugador${organizedPlayers.unassignedPlayers.length === 1 ? '' : 'es'}</span>
                          </div>
                          <div class="group-players">
                            ${organizedPlayers.unassignedPlayers
                              .map(
                                (player) => `
                              <div class="group-player-item">
                                <img 
                                  src="${player.avatar_url || "/placeholder-user.jpg"}" 
                                  alt="${player.name}" 
                                  class="player-avatar-tiny"
                                  onerror="this.src='/placeholder-user.jpg'"
                                >
                                <span class="player-name-only">${player.name}</span>
                              </div>
                            `
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                        : ""}
                    </div>
                  `
                  : `
                    <!-- Vista normal para otros tipos de torneo -->
                    <div class="players-grid">
                      ${registeredPlayers
                        .map(
                          (player, index) => `
                        <div class="player-card">
                          <img 
                            src="${player.avatar_url || "/placeholder-user.jpg"}" 
                            alt="${player.name}" 
                            class="player-avatar-detail"
                            onerror="this.src='/placeholder-user.jpg'"
                          >
                          <div class="player-info-detail">
                            <div class="player-name-detail">${player.name}</div>
                            <div class="player-stats-detail">
                              <span class="player-stat-item">#${
                                player.ranking || "N/A"
                              }</span>
                              <span class="player-stat-item">${
                                player.points || 0
                              } pts</span>
                              <span class="player-stat-item">${player.wins || 0}W/${
                            player.losses || 0
                          }L</span>
                              ${
                                player.registration_date
                                  ? `<span class="registration-date-badge">📅 ${new Date(
                                      player.registration_date
                                    ).toLocaleDateString("es-CL")}</span>`
                                  : ""
                              }
                            </div>
                          </div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `
                : `
              <div style="text-align: center; padding: 2rem; color: #9ca3af; background: #374151; border-radius: 8px; margin-top: 12px;">
                <p style="margin: 0;">🏁 <strong>No hay jugadores inscritos</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px;">Los jugadores pueden inscribirse usando el botón "Inscribir Jugadores"</p>
                <button onclick="debugTournamentRegistrations('${tournament.id}')" style="margin-top: 12px; padding: 8px 12px; background: #059669; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                  🔍 Debug Registrations
                </button>
              </div>
            `
            }
          </div>

          ${
            tournament.entry_fee > 0 || tournament.prize_pool > 0
              ? `
          <div class="details-section">
            <h4>💰 Aspectos Económicos</h4>
            <div class="details-grid">
              ${
                tournament.entry_fee > 0
                  ? `
              <div class="detail-item">
                <div class="detail-label">Cuota de Inscripción</div>
                <div class="detail-value">$${tournament.entry_fee.toLocaleString()}</div>
              </div>
              `
                  : ""
              }
              ${
                tournament.prize_pool > 0
                  ? `
              <div class="detail-item">
                <div class="detail-label">Premio Total</div>
                <div class="detail-value">$${tournament.prize_pool.toLocaleString()}</div>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          `
              : ""
          }

          ${
            tournament.location || tournament.description
              ? `
          <div class="details-section">
            <h4>📍 Detalles Adicionales</h4>
            ${
              tournament.location
                ? `
            <div class="detail-item" style="margin-bottom: 8px;">
              <div class="detail-label">Ubicación</div>
              <div class="detail-value">${tournament.location}</div>
            </div>
            `
                : ""
            }
            ${
              tournament.description
                ? `
            <div class="detail-item">
              <div class="detail-label">Descripción</div>
              <div class="detail-value">${tournament.description}</div>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }

          ${
            tournament.rules
              ? `
          <div class="details-section">
            <h4>📜 Reglas del Torneo</h4>
            <div class="detail-item">
              <div class="detail-value" style="white-space: pre-wrap; line-height: 1.5;">${tournament.rules}</div>
            </div>
          </div>
          `
              : ""
          }
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: "✅ Entendido",
      confirmButtonColor: "#10b981",
      background: "#1f2937",
      color: "#f9fafb",
      customClass: {
        popup: "responsive-modal",
      },
      width: "clamp(320px, 95vw, 800px)",
      didOpen: () => {
        // Función para manejar cambios de estado
        window.handleStatusChange = async function (newStatus) {
          // Cerrar el modal actual primero
          Swal.close();

          // Confirmar el cambio de estado
          const statusNames = {
            upcoming: "Próximo",
            ongoing: "En Progreso",
            completed: "Completado",
            cancelled: "Cancelado",
          };

          const statusActions = {
            upcoming: "reprogramar como próximo",
            ongoing: "iniciar",
            completed: "marcar como completado",
            cancelled: "cancelar",
          };

          const confirmation = await Swal.fire({
            title: `🔄 Cambiar Estado del Torneo`,
            html: `
              <div style="text-align: center; padding: 1rem;">
                <p style="margin-bottom: 1rem; font-size: 16px;">
                  ¿Estás seguro de que quieres <strong>${
                    statusActions[newStatus]
                  }</strong> el torneo:
                </p>
                <p style="font-weight: bold; color: #10b981; font-size: 18px; margin-bottom: 1rem;">${
                  tournament.name
                }</p>
                <p style="color: #9ca3af; font-size: 14px;">
                  Estado actual: <span style="color: #f9fafb;">${getStatusText(
                    tournament.status
                  )}</span> → 
                  Nuevo estado: <span style="color: #10b981;">${
                    statusNames[newStatus]
                  }</span>
                </p>
                ${
                  newStatus === "ongoing"
                    ? `
                <div style="margin-top: 1rem; padding: 12px; background: #1e40af; border-radius: 8px;">
                  <p style="margin: 0; color: #93c5fd; font-size: 13px;">
                    ℹ️ Se verificará que haya al menos 2 jugadores inscritos antes de iniciar
                  </p>
                </div>
                `
                    : ""
                }
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "✅ Confirmar Cambio",
            cancelButtonText: "❌ Cancelar",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
            background: "#1f2937",
            color: "#f9fafb",
          });

          if (confirmation.isConfirmed) {
            // Realizar el cambio de estado
            await changeTournamentStatus(tournament, newStatus);
          } else {
            // Si se cancela, volver a mostrar el modal de detalles
            setTimeout(() => viewTournamentDetails(tournament), 100);
          }
        };

        // Función para manejar cambios en el select
        window.handleSelectChange = function () {
          const select = document.getElementById("status-select");
          if (select && select.value !== tournament.status) {
            window.handleStatusChange(select.value);
          }
        };

        // Agregar event listener al select
        const statusSelect = document.getElementById("status-select");
        if (statusSelect) {
          statusSelect.addEventListener("change", window.handleSelectChange);
        }

        // Función de debugging para revisar registraciones
        window.debugTournamentRegistrations = async function (tournamentId) {
          console.log(
            "🔍 Debugging tournament registrations for ID:",
            tournamentId
          );

          try {
            // Verificar si la tabla existe
            const { data: tableCheck, error: tableError } = await supabase
              .from("tournament_registrations")
              .select("*")
              .limit(1);

            if (tableError) {
              console.error("❌ Table check failed:", tableError);
              alert(
                `❌ Error: ${tableError.message}\n\nLa tabla 'tournament_registrations' no existe o no tienes permisos.`
              );
              return;
            }

            console.log("✅ Table exists, checking specific tournament...");

            // Buscar registraciones para este torneo específico
            const registrations =
              await tournamentRegistrationsAPI.getPlayersByTournament(
                tournamentId
              );
            console.log("📊 Tournament registrations:", registrations);

            const stats =
              await tournamentRegistrationsAPI.getTournamentRegistrationStats(
                tournamentId
              );
            console.log("📈 Registration stats:", stats);

            alert(
              `🔍 Debug Results:\n\nTournament ID: ${tournamentId}\nRegistered players: ${
                registrations.length
              }\nStats: ${JSON.stringify(
                stats,
                null,
                2
              )}\n\nCheck console for detailed data.`
            );
          } catch (error) {
            console.error("❌ Debug failed:", error);
            alert(
              `❌ Debug Error: ${error.message}\n\nCheck console for details.`
            );
          }
        };

        // Limpiar funciones cuando se cierre el modal
        const modal = document.querySelector(".swal2-container");
        if (modal) {
          modal.addEventListener("DOMNodeRemoved", function () {
            delete window.handleStatusChange;
            delete window.handleSelectChange;
            delete window.debugTournamentRegistrations;
          });
        }
      },
    });
  };

  // Función para formatear fecha para input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Función auxiliar para organizar jugadores en grupos
  const organizePlayersIntoGroups = (groupsConfig, players) => {
    console.log("🔧 organizePlayersIntoGroups called with:", {
      groupsConfig,
      playersCount: players.length,
      players: players.map(p => ({id: p.id, name: p.name}))
    });

    if (!groupsConfig || !groupsConfig.number_of_groups || players.length === 0) {
      console.log("⚠️ Invalid config or no players, returning empty structure");
      return { hasGroups: false, groups: [], unassignedPlayers: players };
    }

    const numberOfGroups = groupsConfig.number_of_groups;
    const groups = [];
    
    console.log(`📋 Creating ${numberOfGroups} groups...`);
    
    // Crear estructura de grupos
    for (let i = 1; i <= numberOfGroups; i++) {
      groups.push({
        id: i,
        name: `Grupo ${i}`,
        players: []
      });
    }
    
    // Si hay configuración de grupos específica, usarla
    if (groupsConfig.groups && Object.keys(groupsConfig.groups).length > 0) {
      console.log("🎯 Using specific group assignments:", groupsConfig.groups);
      
      const playersMap = new Map(players.map(p => [p.id, p]));
      const assignedPlayerIds = new Set();
      
      Object.entries(groupsConfig.groups).forEach(([groupKey, playerIds]) => {
        console.log(`Processing group ${groupKey}:`, playerIds);
        
        if (Array.isArray(playerIds) && groupKey.startsWith('grupo_')) {
          const groupNumber = parseInt(groupKey.split('_')[1]);
          const group = groups.find(g => g.id === groupNumber);
          
          if (group) {
            group.players = playerIds.map((playerId) => {
              const player = playersMap.get(playerId);
              if (player) {
                assignedPlayerIds.add(playerId);
                console.log(`✅ Assigned ${player.name} to ${group.name}`);
              }
              return player;
            }).filter(Boolean);
          }
        }
      });
      
      // Jugadores no asignados a ningún grupo
      const unassignedPlayers = players.filter(player => !assignedPlayerIds.has(player.id));
      
      console.log("📊 Final group assignments:", {
        groups: groups.map(g => ({name: g.name, playerCount: g.players.length})),
        unassignedCount: unassignedPlayers.length
      });
      
      return { 
        hasGroups: true, 
        groups: groups, // Incluir todos los grupos, incluso vacíos para Round Robin
        unassignedPlayers 
      };
    } else {
      console.log("🔄 No specific assignments, distributing players automatically...");
      
      // Distribuir jugadores equitativamente si no hay configuración específica
      players.forEach((player, index) => {
        const groupIndex = index % numberOfGroups;
        groups[groupIndex].players.push(player);
        console.log(`🎲 Auto-assigned ${player.name} to ${groups[groupIndex].name}`);
      });
      
      console.log("📊 Auto-distribution complete:", {
        groups: groups.map(g => ({name: g.name, playerCount: g.players.length}))
      });
      
      return { 
        hasGroups: true, 
        groups: groups.filter(g => g.players.length > 0), 
        unassignedPlayers: [] 
      };
    }
  };

  // Función para eliminar torneo (solo si está en estado "upcoming")
  const deleteTournament = async (tournament) => {
    // Verificar que el torneo esté en estado "upcoming"
    if (tournament.status !== "upcoming") {
      Swal.fire({
        title: "❌ No se puede eliminar",
        text: "Solo se pueden eliminar torneos que estén en estado 'Próximo'",
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    // Verificar si hay jugadores inscritos
    let registeredPlayersCount = 0;
    try {
      const registeredPlayers = await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id);
      registeredPlayersCount = registeredPlayers.length;
    } catch (error) {
      console.error("Error checking registered players:", error);
    }

    // Mostrar confirmación con información adicional
    const confirmation = await Swal.fire({
      title: "🗑️ Eliminar Torneo",
      html: `
        <div style="text-align: center; padding: 1rem; color: #e5e7eb;">
          <p style="margin-bottom: 1rem; font-size: 18px; font-weight: bold;">
            ¿Estás seguro de que quieres eliminar el torneo:
          </p>
          <p style="margin-bottom: 1rem; font-size: 20px; color: #10b981; font-weight: bold;">
            "${tournament.name}"
          </p>
          ${registeredPlayersCount > 0 ? `
            <div style="background: #fbbf24; color: #1f2937; padding: 12px; border-radius: 8px; margin: 1rem 0;">
              <p style="font-weight: bold; margin-bottom: 4px;">⚠️ Atención</p>
              <p>Este torneo tiene ${registeredPlayersCount} jugador${registeredPlayersCount === 1 ? '' : 'es'} inscrito${registeredPlayersCount === 1 ? '' : 's'}</p>
              <p>Se eliminarán todas las inscripciones</p>
            </div>
          ` : ''}
          <p style="color: #ef4444; font-weight: bold; margin-top: 1rem;">
            Esta acción no se puede deshacer
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1f2937",
      color: "#f9fafb",
    });

    if (confirmation.isConfirmed) {
      try {
        // Mostrar indicador de carga
        Swal.fire({
          title: "Eliminando torneo...",
          text: "Por favor espera",
          icon: "info",
          background: "#1f2937",
          color: "#f9fafb",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Eliminar el torneo usando la API
        await tournamentsAPI.delete(tournament.id);

        // Recargar la lista de torneos
        await loadTournaments();

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "✅ Torneo eliminado",
          text: `El torneo "${tournament.name}" ha sido eliminado correctamente`,
          icon: "success",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonColor: "#10b981",
        });

        console.log("Tournament deleted successfully:", tournament.id);
      } catch (error) {
        console.error("Error deleting tournament:", error);
        
        // Mostrar mensaje de error específico
        let errorMessage = "Error desconocido al eliminar el torneo";
        if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: "❌ Error al eliminar",
          text: errorMessage,
          icon: "error",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Función para escapar caracteres especiales en HTML
  const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // Función para editar torneo
  const handleEditTournament = async (tournament) => {
    console.log("Editando torneo:", tournament);
    console.log("Fechas del torneo:", {
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_deadline: tournament.registration_deadline,
    });
    const { value: formData } = await Swal.fire({
      title:
        '<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">📝 Editar Torneo</span>',
      html: `
        <style>
          .responsive-edit-form {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .responsive-edit-form .form-group {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .responsive-edit-form label {
            display: block;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 600;
            margin-bottom: 6px;
            color: #10b981;
            text-align: left;
          }
          .responsive-edit-form .form-input,
          .responsive-edit-form .form-textarea,
          .responsive-edit-form .form-select {
            width: 100%;
            padding: clamp(8px, 2vw, 12px);
            border: 1px solid #4b5563;
            border-radius: 6px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            transition: all 0.3s ease;
            box-sizing: border-box;
          }
          .responsive-edit-form .form-input:focus,
          .responsive-edit-form .form-textarea:focus,
          .responsive-edit-form .form-select:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .responsive-edit-form .form-input::placeholder,
          .responsive-edit-form .form-textarea::placeholder {
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .responsive-edit-form .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(12px, 3vw, 16px);
            background: transparent;
            padding: 0;
            border-radius: 0;
          }
          @media (min-width: 640px) {
            .responsive-edit-form .form-row {
              grid-template-columns: 1fr 1fr;
            }
          }
          .responsive-edit-form .form-textarea {
            resize: vertical;
            min-height: 80px;
          }
          .field-readonly {
            background: #4b5563 !important;
            cursor: not-allowed;
            opacity: 0.7;
          }
          .readonly-notice {
            font-size: 11px;
            color: #9ca3af;
            font-style: italic;
            margin-top: 4px;
          }
        </style>
        <div class="responsive-edit-form">
          <div class="form-group">
            <label for="edit-name">🎾 Nombre del Torneo *</label>
            <input 
              id="edit-name" 
              class="form-input" 
              value="${escapeHtml(tournament.name || "")}"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="edit-description">📄 Descripción</label>
            <textarea 
              id="edit-description" 
              class="form-textarea" 
              rows="3"
            >${escapeHtml(tournament.description || "")}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-startDate">🚀 Fecha de Inicio *</label>
              <input 
                id="edit-startDate" 
                type="date" 
                class="form-input"
                value="${formatDateForInput(tournament.start_date)}"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="edit-endDate">🏁 Fecha de Fin *</label>
              <input 
                id="edit-endDate" 
                type="date" 
                class="form-input"
                value="${formatDateForInput(tournament.end_date)}"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-registrationDeadline">⏰ Fecha Límite de Inscripción *</label>
            <input 
              id="edit-registrationDeadline" 
              type="date" 
              class="form-input"
              value="${formatDateForInput(tournament.registration_deadline)}"
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-tournamentType">🎯 Tipo de Torneo</label>
              <select id="edit-tournamentType" class="form-select field-readonly" disabled>
                <option value="single_elimination" ${
                  tournament.tournament_type === "single_elimination"
                    ? "selected"
                    : ""
                }>🥊 Eliminación Directa</option>
                <option value="round_robin" ${
                  tournament.tournament_type === "round_robin" ? "selected" : ""
                }>🔄 Round Robin</option>
                <option value="swiss" ${
                  tournament.tournament_type === "swiss" ? "selected" : ""
                }>🇨🇭 Sistema Suizo</option>
              </select>
              <div class="readonly-notice">⚠️ No se puede cambiar después de crear el torneo</div>
            </div>
            
            <div class="form-group">
              <label for="edit-maxPlayers">👥 Máximo de Jugadores *</label>
              <input 
                id="edit-maxPlayers" 
                type="number" 
                class="form-input" 
                min="2" 
                max="128" 
                value="${tournament.max_players || 16}"
                required
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="edit-entryFee">💳 Cuota de Inscripción</label>
              <input 
                id="edit-entryFee" 
                type="number" 
                class="form-input" 
                min="0" 
                value="${tournament.entry_fee || 0}"
              >
            </div>
            
            <div class="form-group">
              <label for="edit-prizePool">🏆 Premio Total</label>
              <input 
                id="edit-prizePool" 
                type="number" 
                class="form-input" 
                min="0" 
                value="${tournament.prize_pool || 0}"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-location">🏢 Ubicación</label>
            <input 
              id="edit-location" 
              class="form-input" 
              value="${escapeHtml(tournament.location || "")}"
            >
          </div>
          
          <div class="form-group">
            <label for="edit-rules">📜 Reglas Específicas</label>
            <textarea 
              id="edit-rules" 
              class="form-textarea" 
              rows="4"
            >${escapeHtml(tournament.rules || "")}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "💾 Guardar Cambios",
      cancelButtonText: "❌ Cancelar",
      background: "#1f2937",
      color: "#f9fafb",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "responsive-modal",
      },
      preConfirm: () => {
        const name = document.getElementById("edit-name").value;
        const description = document.getElementById("edit-description").value;
        const startDate = document.getElementById("edit-startDate").value;
        const endDate = document.getElementById("edit-endDate").value;
        const registrationDeadline = document.getElementById(
          "edit-registrationDeadline"
        ).value;
        const maxPlayers = parseInt(
          document.getElementById("edit-maxPlayers").value
        );
        const entryFee =
          parseFloat(document.getElementById("edit-entryFee").value) || 0;
        const prizePool =
          parseFloat(document.getElementById("edit-prizePool").value) || 0;
        const location = document.getElementById("edit-location").value;
        const rules = document.getElementById("edit-rules").value;

        if (!name || !startDate || !endDate || !registrationDeadline) {
          Swal.showValidationMessage(
            "Por favor completa todos los campos obligatorios"
          );
          return false;
        }

        if (new Date(startDate) <= new Date()) {
          Swal.showValidationMessage("La fecha de inicio debe ser futura");
          return false;
        }

        if (new Date(endDate) <= new Date(startDate)) {
          Swal.showValidationMessage(
            "La fecha de fin debe ser posterior a la fecha de inicio"
          );
          return false;
        }

        if (new Date(registrationDeadline) >= new Date(startDate)) {
          Swal.showValidationMessage(
            "La fecha límite de inscripción debe ser anterior al inicio"
          );
          return false;
        }

        if (maxPlayers < 2 || maxPlayers > 128) {
          Swal.showValidationMessage(
            "El número de jugadores debe estar entre 2 y 128"
          );
          return false;
        }

        // Validar potencia de 2 para eliminación directa
        if (
          tournament.tournament_type === "single_elimination" &&
          (maxPlayers & (maxPlayers - 1)) !== 0
        ) {
          Swal.showValidationMessage(
            "Para eliminación directa, el número de jugadores debe ser una potencia de 2 (2, 4, 8, 16, 32, 64, 128)"
          );
          return false;
        }

        return {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          registration_deadline: registrationDeadline,
          max_players: maxPlayers,
          entry_fee: entryFee,
          prize_pool: prizePool,
          location,
          rules,
        };
      },
    });

    if (formData) {
      try {
        // Actualizar el torneo usando la API
        await tournamentsAPI.update(tournament.id, formData);

        await Swal.fire({
          title: "🎉 ¡Éxito!",
          text: "Torneo actualizado correctamente",
          icon: "success",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonColor: "#10b981",
        });

        // Recargar torneos
        await loadTournaments();
      } catch (error) {
        console.error("Error actualizando torneo:", error);

        let errorMessage =
          error.message || "Error desconocido al actualizar el torneo";

        // Mensajes de error más user-friendly
        if (errorMessage.includes("No se pueden modificar")) {
          errorMessage =
            "⚠️ " +
            errorMessage +
            "\n\n💡 Solo se pueden editar torneos que aún no hayan comenzado.";
        } else if (errorMessage.includes("Torneo no encontrado")) {
          errorMessage =
            "❌ El torneo no fue encontrado.\n\n💡 Es posible que haya sido eliminado por otro usuario.";
        }

        Swal.fire({
          title: "❌ Error al Actualizar Torneo",
          html: `
            <div style="text-align: left; padding: 1rem; background: #374151; border-radius: 8px; margin: 1rem 0;">
              <p style="margin: 0; color: #f9fafb; line-height: 1.5;">${errorMessage}</p>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #1e3a8a; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 0.9rem;">
                <strong>📋 Información técnica:</strong><br>
                Revisa la consola del navegador (F12) para más detalles específicos del error.
              </p>
            </div>
          `,
          icon: "error",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonText: "🔍 Entendido",
          confirmButtonColor: "#ef4444",
          width: "600px",
        });
      }
    }
  };

  // Función para inscribir jugadores al torneo
  const registerPlayersToTournament = async (tournament) => {
    // Cargar todos los jugadores y separar inscritos de disponibles
    let allPlayers = [];
    let registeredPlayers = [];
    let availablePlayers = [];

    try {
      allPlayers = await playersAPI.getAll();

      // Obtener jugadores ya inscritos en el torneo
      registeredPlayers =
        await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id);

      // Filtrar jugadores disponibles (que no estén ya inscritos)
      const registeredPlayerIds = registeredPlayers.map((p) => p.id);
      availablePlayers = allPlayers.filter(
        (player) => !registeredPlayerIds.includes(player.id)
      );
    } catch (error) {
      console.error("Error cargando jugadores:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los jugadores disponibles",
        icon: "error",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const { value: selectedPlayers } = await Swal.fire({
      title: `<span style="color: #10b981; font-size: clamp(16px, 4vw, 20px); font-weight: bold;">👥 Inscribir Jugadores - ${tournament.name}</span>`,
      html: `
        <style>
          .register-players-modal {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .tournament-info {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
            text-align: center;
          }
          .tournament-info .info-item {
            display: inline-block;
            margin: 0 clamp(8px, 2vw, 12px);
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .tournament-info .info-value {
            color: #10b981;
            font-weight: bold;
          }
          .players-section {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
          }
          .players-section h4 {
            color: #10b981;
            font-size: clamp(14px, 3vw, 16px);
            font-weight: bold;
            margin: 0 0 clamp(12px, 3vw, 16px) 0;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .registered-players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 8px;
            max-height: 150px;
            overflow-y: auto;
            padding: 4px;
          }
          .registered-player-card {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #1f2937;
            border-radius: 6px;
            border: 1px solid #059669;
            gap: 8px;
          }
          .player-avatar-small {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #10b981;
          }
          .player-details-compact {
            flex: 1;
            min-width: 0;
          }
          .player-name-compact {
            font-weight: 500;
            color: #f9fafb;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .player-rank-compact {
            font-size: 11px;
            color: #9ca3af;
          }
          .multi-select-dropdown {
            position: relative;
            margin-bottom: 16px;
          }
          .multi-select-trigger {
            width: 100%;
            padding: clamp(10px, 2.5vw, 12px);
            border: 2px solid #4b5563;
            border-radius: 8px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            cursor: pointer;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            min-height: 44px;
          }
          .multi-select-trigger:hover {
            border-color: #10b981;
          }
          .multi-select-trigger.active {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .multi-select-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1f2937;
            border: 2px solid #4b5563;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          .multi-select-content.show {
            display: block;
          }
          .multi-select-option {
            padding: 10px 12px;
            border-bottom: 1px solid #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: background-color 0.2s;
          }
          .multi-select-option:hover {
            background-color: #374151;
          }
          .multi-select-option:last-child {
            border-bottom: none;
          }
          .multi-select-checkbox {
            margin: 0;
            accent-color: #10b981;
            transform: scale(1.1);
          }
          .selected-count-badge {
            background: #10b981;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          }
          .dropdown-arrow {
            transition: transform 0.2s;
            color: #9ca3af;
          }
          .dropdown-arrow.rotated {
            transform: rotate(180deg);
          }
          .empty-state {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-style: italic;
          }
        </style>
        <div class="register-players-modal">
          <div class="tournament-info">
            <div class="info-item">Inscritos: <span class="info-value">${
              registeredPlayers.length
            }/${tournament.max_players}</span></div>
            <div class="info-item">Tipo: <span class="info-value">${getTournamentTypeText(
              tournament.tournament_type
            )}</span></div>
            <div class="info-item">Estado: <span class="info-value">${getStatusText(
              tournament.status
            )}</span></div>
          </div>
          
          <!-- Jugadores Ya Inscritos -->
          <div class="players-section">
            <h4>✅ Jugadores Inscritos (${registeredPlayers.length})</h4>
            ${
              registeredPlayers.length > 0
                ? `
              <div class="registered-players-grid">
                ${registeredPlayers
                  .map(
                    (player) => `
                  <div class="registered-player-card">
                    <img 
                      src="${player.avatar_url || "/placeholder-user.jpg"}" 
                      alt="${player.name}" 
                      class="player-avatar-small"
                      onerror="this.src='/placeholder-user.jpg'"
                    >
                    <div class="player-details-compact">
                      <div class="player-name-compact">${player.name}</div>
                      <div class="player-rank-compact">#${
                        player.ranking || "N/A"
                      } • ${player.points || 0} pts</div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : `
              <div style="text-align: center; padding: 1.5rem; color: #9ca3af; background: #1e3a8a; border-radius: 8px; margin-top: 12px;">
                🚨 <strong>Error cargando datos</strong><br>
                <span style="font-size: 14px;">Verifica que la tabla 'tournament_registrations' exista en Supabase</span>
              </div>
            `
            }
          </div>
          
          ${
            tournament.status === "upcoming" && availablePlayers.length > 0
              ? `
          <!-- Inscribir Nuevos Jugadores -->
          <div class="players-section">
            <h4>➕ Inscribir Nuevos Jugadores</h4>
            <div class="multi-select-dropdown">
              <div class="multi-select-trigger" onclick="toggleMultiSelect()">
                <span id="multi-select-text">Seleccionar jugadores para inscribir...</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="selected-count-badge" class="selected-count-badge" style="display: none;">0</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
              <div id="multi-select-content" class="multi-select-content">
                ${availablePlayers
                  .map(
                    (player) => `
                  <div class="multi-select-option" onclick="togglePlayerOption('${
                    player.id
                  }', event)">
                    <input 
                      type="checkbox" 
                      class="multi-select-checkbox" 
                      id="player-option-${player.id}"
                      data-player-id="${player.id}"
                      onclick="event.stopPropagation()"
                      onchange="updateMultiSelectDisplay()"
                    >
                    <img 
                      src="${player.avatar_url || "/placeholder-user.jpg"}" 
                      alt="${player.name}" 
                      class="player-avatar-small"
                      onerror="this.src='/placeholder-user.jpg'"
                    >
                    <div class="player-details-compact">
                      <div class="player-name-compact">${player.name}</div>
                      <div class="player-rank-compact">#${
                        player.ranking || "N/A"
                      } • ${player.points || 0} pts • ${player.wins || 0}W/${
                      player.losses || 0
                    }L</div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          ${
            tournament.status !== "upcoming"
              ? `
          <div style="margin-top: 12px; padding: 12px; background: #dc2626; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px;">
              ⚠️ Solo se pueden inscribir jugadores en torneos con estado "Próximo"
            </p>
          </div>
          `
              : availablePlayers.length === 0 &&
                tournament.status === "upcoming"
              ? `
          <div style="margin-top: 12px; padding: 12px; background: #1e40af; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #93c5fd; font-size: 14px;">
              ℹ️ Todos los jugadores disponibles ya están inscritos en este torneo
            </p>
          </div>
          `
              : ""
          }
        </div>
      `,
      showCancelButton: true,
      confirmButtonText:
        tournament.status === "upcoming"
          ? "✅ Inscribir Jugadores"
          : "🔍 Entendido",
      cancelButtonText: "❌ Cancelar",
      background: "#1f2937",
      color: "#f9fafb",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "responsive-modal",
      },
      width: "clamp(320px, 95vw, 700px)",
      didOpen: () => {
        // Funciones para el multi-select dropdown
        window.toggleMultiSelect = function () {
          const content = document.getElementById("multi-select-content");
          const trigger = document.querySelector(".multi-select-trigger");
          const arrow = document.querySelector(".dropdown-arrow");

          if (content && trigger && arrow) {
            const isVisible = content.classList.contains("show");
            content.classList.toggle("show");
            trigger.classList.toggle("active");
            arrow.classList.toggle("rotated");
          }
        };

        window.togglePlayerOption = function (playerId, event) {
          event.stopPropagation();
          const checkbox = document.getElementById("player-option-" + playerId);
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            window.updateMultiSelectDisplay();
          }
        };

        window.updateMultiSelectDisplay = function () {
          const checkboxes = document.querySelectorAll(
            ".multi-select-checkbox"
          );
          const selectedCount = Array.from(checkboxes).filter(
            (cb) => cb.checked
          ).length;
          const countBadge = document.getElementById("selected-count-badge");
          const textElement = document.getElementById("multi-select-text");

          if (countBadge && textElement) {
            if (selectedCount > 0) {
              countBadge.style.display = "inline";
              countBadge.textContent = selectedCount;
              textElement.textContent =
                selectedCount === 1
                  ? "1 jugador seleccionado"
                  : selectedCount + " jugadores seleccionados";
            } else {
              countBadge.style.display = "none";
              textElement.textContent =
                "Seleccionar jugadores para inscribir...";
            }
          }
        };

        // Cerrar dropdown al hacer click fuera
        const handleClickOutside = function (event) {
          const dropdown = document.querySelector(".multi-select-dropdown");
          if (dropdown && !dropdown.contains(event.target)) {
            const content = document.getElementById("multi-select-content");
            const trigger = document.querySelector(".multi-select-trigger");
            const arrow = document.querySelector(".dropdown-arrow");
            if (content && trigger && arrow) {
              content.classList.remove("show");
              trigger.classList.remove("active");
              arrow.classList.remove("rotated");
            }
          }
        };

        document.addEventListener("click", handleClickOutside);

        // Limpiar event listeners cuando se cierre el modal
        const modal = document.querySelector(".swal2-container");
        if (modal) {
          modal.addEventListener("DOMNodeRemoved", function () {
            document.removeEventListener("click", handleClickOutside);
            delete window.toggleMultiSelect;
            delete window.togglePlayerOption;
            delete window.updateMultiSelectDisplay;
          });
        }
      },
      preConfirm: () => {
        if (tournament.status !== "upcoming") return null;

        const checkboxes = document.querySelectorAll(
          ".multi-select-checkbox:checked"
        );
        const selected = Array.from(checkboxes).map(
          (cb) => cb.dataset.playerId
        );

        if (selected.length === 0) {
          Swal.showValidationMessage(
            "Selecciona al menos un jugador para inscribir"
          );
          return false;
        }

        // Validar que no se exceda el límite máximo
        const remainingSlots =
          tournament.max_players - registeredPlayers.length;
        if (selected.length > remainingSlots) {
          Swal.showValidationMessage(
            "Solo quedan " + remainingSlots + " cupos disponibles en el torneo"
          );
          return false;
        }

        return selected;
      },
    });

    if (selectedPlayers && selectedPlayers.length > 0) {
      try {
        // Inscribir jugadores usando la API real
        await tournamentRegistrationsAPI.registerPlayers(
          tournament.id,
          selectedPlayers
        );

        await Swal.fire({
          title: "🎉 ¡Éxito!",
          html: `
            <div style="text-align: center; padding: 1rem;">
              <p style="margin-bottom: 1rem; font-size: 16px;">
                Se han inscrito <strong>${
                  selectedPlayers.length
                }</strong> jugador${
            selectedPlayers.length === 1 ? "" : "es"
          } al torneo:
              </p>
              <p style="font-weight: bold; color: #10b981; font-size: 18px;">${
                tournament.name
              }</p>
              <div style="margin-top: 1rem; padding: 12px; background: #374151; border-radius: 8px;">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                  ✅ Los jugadores han sido registrados exitosamente en la base de datos
                </p>
              </div>
            </div>
          `,
          icon: "success",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonColor: "#10b981",
          confirmButtonText: "✅ Perfecto",
        });

        // Recargar torneos para actualizar la vista
        await loadTournaments();
      } catch (error) {
        console.error("Error inscribiendo jugadores:", error);

        let errorMessage =
          error.message || "Error desconocido al inscribir jugadores";

        // Mensajes de error más user-friendly
        if (
          errorMessage.includes('tabla "tournament_registrations" no existe')
        ) {
          errorMessage =
            '❌ La tabla de inscripciones no existe en la base de datos.\n\n💡 Solución: Necesitas crear la tabla "tournament_registrations" en Supabase.';
        } else if (errorMessage.includes("ya están inscritos")) {
          errorMessage =
            "⚠️ Algunos jugadores ya están inscritos en este torneo.\n\n💡 Intenta seleccionar solo jugadores que no estén registrados.";
        } else if (errorMessage.includes("Solo quedan")) {
          errorMessage =
            "🚫 " +
            errorMessage +
            "\n\n💡 Selecciona menos jugadores o aumenta el límite máximo del torneo.";
        }

        Swal.fire({
          title: "❌ Error al Inscribir Jugadores",
          html: `
            <div style="text-align: left; padding: 1rem; background: #374151; border-radius: 8px; margin: 1rem 0;">
              <p style="margin: 0; color: #f9fafb; line-height: 1.5;">${errorMessage}</p>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #1e3a8a; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 0.9rem;">
                <strong>📋 Información técnica:</strong><br>
                Revisa la consola del navegador (F12) para más detalles específicos del error.
              </p>
            </div>
          `,
          icon: "error",
          background: "#1f2937",
          color: "#f9fafb",
          confirmButtonText: "🔍 Entendido",
          confirmButtonColor: "#ef4444",
          width: "600px",
        });
      }
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTournaments();
  }, []);

  // Agregar estilos responsive (mismo que player modal)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .responsive-modal {
        width: clamp(320px, 95vw, 800px) !important;
        max-width: 95vw !important;
        margin: clamp(10px, 2vh, 20px) auto !important;
      }
      .swal-html-container {
        max-height: 70vh !important;
        overflow-y: auto !important;
        padding: 0 !important;
      }
      @media (max-width: 640px) {
        .responsive-modal {
          margin: 5px auto !important;
        }
        .swal2-popup {
          font-size: 14px !important;
        }
        .swal2-title {
          font-size: 18px !important;
          padding: 10px !important;
        }
        .swal2-actions {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .swal2-confirm, .swal2-cancel {
          width: 100% !important;
          margin: 0 !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
            <p className="text-muted-foreground">Cargando torneos...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
          <p className="text-muted-foreground">
            Gestión de torneos activos, próximos y histórico
          </p>
        </div>
        <Button onClick={handleAddTournament}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Torneo
        </Button>
      </div>

      {/* Tournament Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {tournamentStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Torneos Activos</CardTitle>
          <CardDescription>Competencias en curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeTournaments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay torneos activos
              </p>
            ) : (
              activeTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-accent/50 hover:border-primary/50"
                  onClick={() => {
                    console.log(
                      "Clickeando card de torneo activo:",
                      tournament.name
                    );
                    viewTournamentDetails(tournament);
                  }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {getTournamentTypeText(tournament.tournament_type)}
                        </span>
                        <span>{tournament.max_players} máx. participantes</span>
                        <span>
                          {formatDate(tournament.start_date)} -{" "}
                          {formatDate(tournament.end_date)}
                        </span>
                      </div>
                      {tournament.prize_pool > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Premio:</span> $
                          {tournament.prize_pool.toLocaleString()}
                        </p>
                      )}
                      {tournament.location && (
                        <p className="text-sm">
                          <span className="font-medium">Ubicación:</span>{" "}
                          {tournament.location}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusBadgeColor(tournament.status)}>
                      {getStatusText(tournament.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {getCurrentRound(tournament)}</span>
                      <span>{getTournamentProgress(tournament)}%</span>
                    </div>
                    <Progress
                      value={getTournamentProgress(tournament)}
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-blue-600 font-medium opacity-70">
                      📋 Click para ver detalles del torneo
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(
                            "Clickeando Ver Bracket para:",
                            tournament.name
                          );
                          // TODO: Implementar vista de bracket
                        }}>
                        <Network className="h-4 w-4 mr-2" />
                        Ver Bracket
                      </Button>
                      <Button
                        size="sm"
                        className="bg-slate-600 hover:bg-slate-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(
                            "Clickeando Gestionar para:",
                            tournament.name
                          );
                          // TODO: Implementar gestión de torneo
                        }}>
                        <Settings className="h-4 w-4 mr-2" />
                        Gestionar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Torneos</CardTitle>
            <CardDescription>Competencias programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTournaments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay torneos próximos
                </p>
              ) : (
                upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{tournament.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        {getTournamentTypeText(tournament.tournament_type)} •{" "}
                        {tournament.max_players} máx. participantes
                      </p>
                      <p>Inicio: {formatDate(tournament.start_date)}</p>
                      <p>
                        Inscripciones hasta:{" "}
                        {formatDate(tournament.registration_deadline)}
                      </p>
                      {tournament.prize_pool > 0 && (
                        <p className="font-medium text-foreground">
                          Premio: ${tournament.prize_pool.toLocaleString()}
                        </p>
                      )}
                      {tournament.entry_fee > 0 && (
                        <p>
                          Cuota de inscripción: $
                          {tournament.entry_fee.toLocaleString()}
                        </p>
                      )}
                      {tournament.location && (
                        <p>Ubicación: {tournament.location}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700"
                        onClick={() => {
                          console.log(
                            "Clickeando Ver Detalles para:",
                            tournament.name
                          );
                          viewTournamentDetails(tournament);
                        }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:border-amber-600 hover:text-amber-700"
                        onClick={() => {
                          console.log(
                            "Clickeando Editar para:",
                            tournament.name
                          );
                          handleEditTournament(tournament);
                        }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                        onClick={() => {
                          console.log(
                            "Clickeando Eliminar para:",
                            tournament.name
                          );
                          deleteTournament(tournament);
                        }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          console.log(
                            "Clickeando Inscribir Jugadores para:",
                            tournament.name
                          );
                          registerPlayersToTournament(tournament);
                        }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inscribir Jugadores
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Torneos Anteriores</CardTitle>
            <CardDescription>Historial de competencias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastTournaments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay torneos completados
                </p>
              ) : (
                pastTournaments.map((tournament) => (
                  <div key={tournament.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{tournament.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Tipo:</span>{" "}
                        <span>
                          {getTournamentTypeText(tournament.tournament_type)}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {tournament.max_players} participantes •{" "}
                        {formatDate(tournament.end_date)}
                      </p>
                      {tournament.prize_pool > 0 && (
                        <p className="font-medium">
                          Premio: ${tournament.prize_pool.toLocaleString()}
                        </p>
                      )}
                      {tournament.location && (
                        <p className="text-muted-foreground">
                          Ubicación: {tournament.location}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 hover:text-purple-700"
                        onClick={() => {
                          console.log(
                            "Clickeando Ver Resultados para:",
                            tournament.name
                          );
                          viewTournamentDetails(tournament);
                        }}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Resultados
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
