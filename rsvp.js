/* rsvp.js - Versão atualizada com integração à API */

document.addEventListener('DOMContentLoaded', () => {
    // RSVP Form Handling
    const rsvpForm = document.querySelector('.rsvp-form');
    const presencaRadios = document.querySelectorAll('input[name="presenca"]');
    const acompanhantesGroup = document.getElementById('acompanhantes-group');
    const acompanhantesSelect = document.getElementById('acompanhantes');
    const acompanhantesInfo = document.getElementById('acompanhantes-info');
    const submitButton = rsvpForm ? rsvpForm.querySelector('button[type="submit"]') : null;
    const formStatus = document.createElement('div');
    formStatus.className = 'form-status';
    
    if (rsvpForm) {
        rsvpForm.appendChild(formStatus);
    }
    
    // Show/hide acompanhantes fields based on attendance
    presencaRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'sim') {
                acompanhantesGroup.classList.remove('hidden');
            } else {
                acompanhantesGroup.classList.add('hidden');
                acompanhantesInfo.classList.add('hidden');
                acompanhantesSelect.value = '0';
            }
        });
    });
    
    // Show/hide acompanhantes names field based on number
    acompanhantesSelect.addEventListener('change', () => {
        if (parseInt(acompanhantesSelect.value) > 0) {
            acompanhantesInfo.classList.remove('hidden');
        } else {
            acompanhantesInfo.classList.add('hidden');
        }
    });
    
    // Form submission with API integration
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable submit button and show loading
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Enviando...';
            }
            
            formStatus.innerHTML = '<p class="status-loading">Enviando sua confirmação...</p>';
            
            // Get form data
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const presenca = document.querySelector('input[name="presenca"]:checked').value;
            const acompanhantes = parseInt(acompanhantesSelect.value);
            const nomesAcompanhantes = document.getElementById('nomes-acompanhantes') ? 
                document.getElementById('nomes-acompanhantes').value : '';
            const restricoes = document.getElementById('restricoes').value;
            const mensagem = document.getElementById('mensagem').value;
            
            // Create data object
            const rsvpData = {
                nome,
                email,
                telefone,
                presenca,
                acompanhantes,
                nomes_acompanhantes: nomesAcompanhantes,
                restricoes,
                mensagem
            };
            
            try {
                // Check if API client is available
                if (window.ApiClient) {
                    const response = await window.ApiClient.submitRSVP(rsvpData);
                    
                    if (response.success) {
                        formStatus.innerHTML = '<p class="status-success">Sua presença foi confirmada com sucesso! Obrigado.</p>';
                        rsvpForm.reset();
                        acompanhantesInfo.classList.add('hidden');
                    } else {
                        formStatus.innerHTML = `<p class="status-error">Erro: ${response.error}</p>`;
                    }
                } else {
                    // Fallback for when API is not available
                    console.log('API client not available, using fallback');
                    setTimeout(() => {
                        formStatus.innerHTML = '<p class="status-success">Sua presença foi confirmada com sucesso! (Modo demonstração)</p>';
                        rsvpForm.reset();
                        acompanhantesInfo.classList.add('hidden');
                    }, 1500);
                }
            } catch (error) {
                console.error('Error submitting RSVP:', error);
                formStatus.innerHTML = '<p class="status-error">Ocorreu um erro ao enviar sua confirmação. Por favor, tente novamente.</p>';
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Confirmar Presença';
                }
            }
        });
    }
    
    // Countdown Timer
    const countdownDisplay = document.getElementById('rsvp-countdown');
    if (countdownDisplay) {
        const countDays = document.getElementById('count-days');
        const countHours = document.getElementById('count-hours');
        const countMinutes = document.getElementById('count-minutes');
        const countSeconds = document.getElementById('count-seconds');
        
        const weddingDate = new Date('December 31, 2025 18:00:00').getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = weddingDate - now;
            
            if (distance < 0) {
                countDays.textContent = '00';
                countHours.textContent = '00';
                countMinutes.textContent = '00';
                countSeconds.textContent = '00';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countDays.textContent = days.toString().padStart(2, '0');
            countHours.textContent = hours.toString().padStart(2, '0');
            countMinutes.textContent = minutes.toString().padStart(2, '0');
            countSeconds.textContent = seconds.toString().padStart(2, '0');
        };
        
        // Update countdown immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});

