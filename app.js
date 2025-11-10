// Plant data structure and management
class GardenApp {
  constructor() {
    this.plants = []
    this.selectedPlant = null
    this.init()
  }

  init() {
    this.loadPlants()
    this.setupEventListeners()
    this.render()
  }

  setupEventListeners() {
    // Form submission
    document.getElementById("thoughtForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addPlant()
    })

    // Modal close
    document.querySelector(".modal-close").addEventListener("click", () => {
      this.closeModal()
    })

    document.getElementById("plantModal").addEventListener("click", (e) => {
      if (e.target.id === "plantModal") {
        this.closeModal()
      }
    })

    // Remove button
    document.getElementById("removeButton").addEventListener("click", () => {
      if (this.selectedPlant) {
        this.removePlant(this.selectedPlant.id)
        this.closeModal()
      }
    })
  }

  addPlant() {
    const text = document.getElementById("thoughtText").value.trim()
    const mood = document.getElementById("moodSelect").value

    if (!text) return

    const plant = {
      id: Date.now().toString(),
      text,
      mood,
      createdAt: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
    }

    this.plants.push(plant)
    this.savePlants()
    this.render()

    // Reset form
    document.getElementById("thoughtForm").reset()
    document.getElementById("moodSelect").value = "calm"
  }

  removePlant(id) {
    this.plants = this.plants.filter((p) => p.id !== id)
    this.savePlants()
    this.render()
  }

  getPlantStage(createdAt) {
    const ageMs = Date.now() - createdAt
    const ageDays = ageMs / (1000 * 60 * 60 * 24)

    if (ageDays < 1) return "seed"
    if (ageDays < 3) return "sprout"
    return "flower"
  }

  getMoodColor(mood) {
    const colors = {
      calm: "#a8d5d7",
      joyful: "#ffd89b",
      grateful: "#ffb3ba",
      hopeful: "#bae1ff",
    }
    return colors[mood] || "#a8d5d7"
  }

  createPlantSVG(stage, mood) {
    const color = this.getMoodColor(mood)
    let plantPath = ""

    if (stage === "seed") {
      plantPath = `
        <ellipse cx="50" cy="70" rx="12" ry="8" fill="#d4a574" opacity="0.6" />
        <ellipse cx="50" cy="70" rx="8" ry="5" fill="#c9915f" opacity="0.4" />
      `
    } else if (stage === "sprout") {
      plantPath = `
        <ellipse cx="50" cy="70" rx="14" ry="6" fill="#d4a574" opacity="0.5" />
        <path d="M 50,64 Q 47,48 48,30" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 50,64 Q 53,46 52,28" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7" />
        <ellipse cx="42" cy="45" rx="6" ry="10" fill="${color}" opacity="0.7" transform="rotate(-35 42 45)" />
        <ellipse cx="58" cy="40" rx="6" ry="10" fill="${color}" opacity="0.7" transform="rotate(35 58 40)" />
      `
    } else {
      // flower
      plantPath = `
        <ellipse cx="50" cy="70" rx="16" ry="7" fill="#d4a574" opacity="0.5" />
        <path d="M 50,62 Q 48,45 47,20" stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round" />
        <path d="M 47,40 Q 38,42 32,45" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.8" />
        <path d="M 47,30 Q 58,28 64,32" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.8" />
        <ellipse cx="38" cy="42" rx="7" ry="11" fill="${color}" opacity="0.8" transform="rotate(-40 38 42)" />
        <ellipse cx="64" cy="34" rx="7" ry="11" fill="${color}" opacity="0.8" transform="rotate(40 64 34)" />
        <ellipse cx="40" cy="55" rx="6" ry="9" fill="${color}" opacity="0.6" transform="rotate(-35 40 55)" />
        <circle cx="50" cy="20" r="4" fill="#fff9e6" opacity="0.9" />
      `

      // Add petals
      const petals = [0, 60, 120, 180, 240, 300]
      for (const angle of petals) {
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * 10
        const y = Math.sin(rad) * 10
        plantPath += `<ellipse cx="${50 + x}" cy="${20 + y}" rx="6" ry="9" fill="${color}" opacity="0.85" transform="rotate(${angle} ${50 + x} ${20 + y})" />`
      }

      plantPath += `<circle cx="50" cy="20" r="3.5" fill="#ffd700" opacity="0.9" />`
    }

    return `
      <svg width="120" height="120" viewBox="0 0 100 100" class="plant-svg">
        <g>${plantPath}</g>
      </svg>
    `
  }

  renderGarden() {
    const container = document.getElementById("gardenContainer")
    const emptyState = document.getElementById("emptyState")

    if (this.plants.length === 0) {
      emptyState.classList.remove("hidden")
      container.innerHTML = ""
      return
    }

    emptyState.classList.add("hidden")

    let gardenHTML = '<div class="ground-line"></div>'

    this.plants.forEach((plant, index) => {
      const stage = this.getPlantStage(plant.createdAt)
      const svg = this.createPlantSVG(stage, plant.mood)

      gardenHTML += `
        <div class="plant-item" style="left: ${plant.x}%; top: ${plant.y}%; --delay: ${index * 0.1}s" data-id="${plant.id}">
          ${svg}
        </div>
      `
    })

    container.innerHTML = gardenHTML

    // Add click handlers
    document.querySelectorAll(".plant-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id")
        this.selectedPlant = this.plants.find((p) => p.id === id)
        this.showModal()
      })
    })
  }

  showModal() {
    if (!this.selectedPlant) return

    const plant = this.selectedPlant
    const modal = document.getElementById("plantModal")
    const stage = this.getPlantStage(plant.createdAt)

    // Calculate age
    const ageMs = Date.now() - plant.createdAt
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
    const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let ageText = "Just planted"
    if (ageDays > 0) ageText = `${ageDays} day${ageDays > 1 ? "s" : ""} old`
    else if (ageHours > 0) ageText = `${ageHours} hour${ageHours > 1 ? "s" : ""} old`

    // Get stage emoji
    let stageEmoji = "🌱 Seedling"
    if (stage === "sprout") stageEmoji = "🌿 Growing"
    else if (stage === "flower") stageEmoji = "🌸 Flower"

    // Set modal content
    document.getElementById("plantAge").textContent = ageText
    document.getElementById("modalThoughtText").textContent = plant.text
    document.getElementById("modalMood").textContent = plant.mood
    document.getElementById("modalStage").textContent = stageEmoji

    const plantDate = new Date(plant.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    document.getElementById("plantDate").textContent = `Planted on ${plantDate}`

    modal.classList.remove("hidden")
  }

  closeModal() {
    document.getElementById("plantModal").classList.add("hidden")
    this.selectedPlant = null
  }

  updateStats() {
    // Update plant count
    document.getElementById("plantCount").textContent = this.plants.length

    // Update moods
    const moodCounts = {}
    this.plants.forEach((p) => {
      moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1
    })

    const moodsList = document.getElementById("moodsList")
    moodsList.innerHTML = ""
    Object.entries(moodCounts).forEach(([mood, count]) => {
      const li = document.createElement("li")
      li.textContent = `${mood} (${count})`
      moodsList.appendChild(li)
    })
  }

  savePlants() {
    localStorage.setItem("mindGardenPlants", JSON.stringify(this.plants))
  }

  loadPlants() {
    const saved = localStorage.getItem("mindGardenPlants")
    if (saved) {
      try {
        this.plants = JSON.parse(saved)
      } catch (e) {
        console.error("Error loading plants:", e)
        this.plants = []
      }
    }
  }

  render() {
    this.renderGarden()
    this.updateStats()
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new GardenApp()
})
