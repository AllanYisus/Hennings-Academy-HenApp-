window.HA = window.HA || {};

HA.Config = HA.Config || {};
HA.Config.URL_UPLOAD_PDF = "https://default863b40a279194b128e0e7678554bee.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/16/workflows/27dca153a40148bca7df16a7b1a1ec29/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=BVSBVhhjo48kk7dbAtqBxDiHyYdG1TrXr3oqhsGa5I8";
HA.Config.URL_ENVIAR_EMAIL = "https://default863b40a279194b128e0e7678554bee.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/25/workflows/b760991191ee4f929f9603aa31dfbe9b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dFd3cioggFgaY9yCxeMKroKFbMVNvIWZ6wijIh0w-tw";

HA.UI = {
    tempColabPhoto: "",
    currentEditingId: null,
    currentProblemsLog: [],
    currentExamAttempts: [],

    closeModal(id) { 
        const modal = document.getElementById(id);
        if(modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    },

    parseDate(val) {
        if (!val) return null;
        const strVal = val.toString().trim();
        
        if (/^\d+$/.test(strVal) || /^\d+\.\d+$/.test(strVal)) {
            const serial = parseFloat(strVal);
            const utcDays = serial - 25569;
            return new Date(utcDays * 86400 * 1000);
        }
        
        if (strVal.includes('/')) {
            const parts = strVal.split('/');
            if (parts.length === 3 && parts[2].length === 4) {
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            }
        }
        
        const d = new Date(strVal);
        return isNaN(d.getTime()) ? null : d;
    },

    formatDateBR(val) { 
        const d = this.parseDate(val);
        if(!d) return '--';
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR'); 
    },

    formatDateInput(val) {
        const d = this.parseDate(val);
        if(!d) return '';
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    },

    openHistory(colabId) {
        const colab = HA.State.colabs.find(c => c.id.toString() === colabId.toString()); 
        const history = HA.State.trainings.filter(t => t.userId.toString() === colabId.toString());
        let container = document.getElementById('modalHistory');
        
        const imgStr = colab.photo ? colab.photo : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
        const aptos = history.filter(t => t.stage === 'Finalizado').map(t => t.area);
        let aptosHtml = aptos.length > 0 ? aptos.map(a => `<span class="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-lg text-[10px] font-bold m-1 uppercase tracking-widest"><i data-lucide="check" class="w-3 h-3 inline"></i> ${a}</span>`).join('') : `<span class="text-xs text-gray-500 italic mt-1 block">Nenhuma área validada ainda.</span>`;

        let html = `
            <div class="glass-card bg-navy-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10 animate-slide-up relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mustard-500/50 to-transparent"></div>
                <div class="bg-navy-950 text-white px-8 py-6 flex justify-between items-center border-b border-white/5">
                    <h2 class="text-sm font-black uppercase tracking-widest text-mustard-500 flex items-center gap-3"><i data-lucide="award" class="w-5 h-5"></i> Perfil Acadêmico DHO</h2>
                    <button type="button" onclick="HA.UI.closeModal('modalHistory')" class="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="p-8 overflow-y-auto custom-scroll flex-1">
                    <div class="flex gap-6 items-center mb-8 pb-8 border-b border-white/5">
                        <img src="${imgStr}" class="w-24 h-24 rounded-full border-2 border-white/10 object-cover shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <div>
                            <h3 class="text-3xl font-light text-white mb-2">${colab.name}</h3>
                            <p class="text-[11px] text-gray-400 font-mono uppercase tracking-widest bg-white/5 inline-block px-3 py-1.5 rounded-xl border border-white/5">ID: ${colab.id} • Líder: ${colab.leader}</p>
                        </div>
                    </div>
                    <div class="mb-8">
                        <h4 class="text-[10px] font-black text-mustard-500 uppercase tracking-widest mb-3">Áreas com Aptidão Comprovada</h4>
                        <div class="w-full bg-white/5 p-5 rounded-2xl border border-white/5">${aptosHtml}</div>
                    </div>
                    <h4 class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Linha do Tempo DHO</h4>`;
                    
        if(history.length === 0) { 
            html += `<div class="p-8 text-center text-gray-500 font-medium bg-white/5 rounded-2xl border border-white/5">Histórico Vazio.</div>`; 
        } else {
            html += `<div class="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-white/10">`;
            history.forEach(t => {
                const isSuccess = t.stage === 'Finalizado'; const color = isSuccess ? 'emerald' : (t.stage==='Reprovado' ? 'rose' : 'mustard');
                html += `
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full border-[6px] border-navy-950 bg-${color}-500/20 text-${color}-400 shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 backdrop-blur-md">
                        <i data-lucide="${isSuccess?'check':'clock'}" class="w-5 h-5"></i>
                    </div>
                    <div class="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-3xl border border-white/5 bg-navy-900 shadow-xl hover:border-${color}-500/50 transition">
                        <div class="flex items-center justify-between mb-2">
                            <div class="font-black text-white text-sm tracking-wide leading-tight">${t.area}</div>
                            <div class="text-[9px] text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-lg">${this.formatDateBR(t.finalizationDate || t.endDate || t.startDate)}</div>
                        </div>
                        <div class="text-[10px] text-gray-400 mb-4 uppercase tracking-widest font-bold">Por: <span class="text-white">${t.facilitator.split(' ')[0]}</span></div>
                        <span class="px-3 py-1.5 bg-${color}-500/10 text-${color}-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-${color}-500/20">${t.stage} (Nota: ${t.score || '--'})</span>
                    </div>
                </div>`;
            }); html += `</div>`;
        }
        html += `</div></div>`;
        container.innerHTML = html; 
        container.classList.remove('hidden'); container.classList.add('flex');
        lucide.createIcons();
    },

    openTrainingModal(id = null) {
        this.injectTrainingModal(); 
        document.getElementById('trainingForm').reset();
        
        this.currentEditingId = id; 
        this.currentProblemsLog = []; 
        this.currentExamAttempts = [];
        
        const uSel = document.getElementById('f-userId'); 
        uSel.innerHTML = '<option value="" disabled selected>Selecionar Colaborador...</option>';
        HA.State.colabs.forEach(c => uSel.innerHTML += `<option value="${c.id}">${c.id} - ${c.name}</option>`);

        const facSel = document.getElementById('f-facilitator'); facSel.innerHTML = '<option value="" disabled selected>Escolha...</option>';
        HA.State.users.filter(u=>u.role==='Facilitador').forEach(u => facSel.innerHTML += `<option value="${u.name}">${u.name}</option>`);

        const secSel = document.getElementById('f-sector'); secSel.innerHTML = '<option value="" disabled selected>Escolha...</option>';
        Object.keys(HA.Constants.Sectors).forEach(s => secSel.innerHTML += `<option value="${s}">${s}</option>`);

        this.resetLockVisuals('Pdf'); this.resetLockVisuals('Email');

        if(id) {
            const t = HA.State.trainings.find(x => x.id.toString() === id.toString());
            if(t) {
                document.getElementById('f-spId').value = t.spId || 0;
                document.getElementById('f-userId').value = t.userId; 
                this.autoFillColab(); 
                
                document.getElementById('f-type').value = t.type;
                document.getElementById('f-sector').value = t.sector; this.updateAreasFicha(); document.getElementById('f-area').value = t.area;
                document.getElementById('f-facilitator').value = t.facilitator !== 'A Definir' ? t.facilitator : '';
                
                const stageSel = document.getElementById('f-stage');
                stageSel.value = t.stage;
                
                document.getElementById('f-startDate').value = this.formatDateInput(t.startDate); 
                document.getElementById('f-endDate').value = this.formatDateInput(t.endDate);
                document.getElementById('f-finalizationDate').value = this.formatDateInput(t.finalizationDate);
                document.getElementById('f-accDate').value = this.formatDateInput(t.accRequestDate); 
                
                document.getElementById('f-accStatus').value = t.accRequestStatus || 'Pendente';
                this.updateAccBadge(t.accRequestStatus);
                
                document.getElementById('f-teoDone').checked = t.accTeoDone || false; document.getElementById('f-praDone').checked = t.accPraDone || false;
                document.getElementById('f-teoNotes').value = t.teoNotes || ''; document.getElementById('f-praNotes').value = t.praNotes || '';

                if(Array.isArray(t.problemsLog)) this.currentProblemsLog = [...t.problemsLog];
                if(Array.isArray(t.examAttempts)) this.currentExamAttempts = [...t.examAttempts];

                if(t.pdfUploaded) this.setLockState('Pdf');
                if(t.emailSent) this.setLockState('Email');
            }
        } else {
            document.getElementById('f-startDate').value = new Date().toISOString().split('T')[0]; this.calcMaxDate();
        }
        
        this.renderProblems(); this.renderAttempts();
        document.getElementById('modalFichaContainer').classList.remove('hidden'); document.getElementById('modalFichaContainer').classList.add('flex');
        lucide.createIcons();
    },

    injectTrainingModal() {
        const container = document.getElementById('modalFichaContainer');
        if (container.innerHTML.trim() !== '') return; 

        container.innerHTML = `
        <div class="glass-card bg-navy-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-6xl max-h-[95vh] flex flex-col border border-white/10 animate-slide-up overflow-hidden relative">
            <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mustard-500/50 to-transparent pointer-events-none"></div>
            
            <div class="bg-navy-950 px-8 py-5 flex justify-between items-center border-b border-white/10 z-10">
                <h2 class="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3"><div class="p-1.5 bg-mustard-500/20 rounded-xl"><i data-lucide="book-open" class="w-4 h-4 text-mustard-500"></i></div> Dossiê Operacional DHO</h2>
                <button type="button" onclick="HA.UI.closeModal('modalFichaContainer')" class="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition border border-transparent hover:border-white/10"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scroll p-0 flex flex-col lg:flex-row bg-[#020617]/50 relative z-0">
                <!-- COLUNA ESQUERDA -->
                <div class="w-full lg:w-1/2 p-8 border-r border-white/5 space-y-8">
                    <form id="trainingForm" class="space-y-8">
                        <input type="hidden" id="f-spId"><input type="hidden" id="f-finalizationDate">

                        <div class="relative pt-4">
                            <div class="absolute top-0 left-0 text-[9px] font-black text-mustard-500 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-mustard-500/20 shadow-md">1. Perfil do Colaborador</div>
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2 bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div class="md:col-span-12 flex items-center gap-5 border-b border-white/5 pb-5">
                                    <img id="f-colabPhoto" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E" class="w-16 h-16 rounded-full object-cover border-2 border-mustard-500/50 shadow-lg bg-navy-900 p-1 flex-shrink-0">
                                    <div class="flex-1">
                                        <label class="label-clean">Matrícula e Nome</label>
                                        <select id="f-userId" onchange="HA.UI.autoFillColab()" class="input-clean cursor-pointer text-white" required></select>
                                    </div>
                                </div>

                                <div class="md:col-span-12 pt-2">
                                    <label class="label-clean text-indigo-400">Líder Responsável</label>
                                    <input type="text" id="f-leader" readonly class="input-clean text-indigo-300 bg-indigo-900/10 border-indigo-500/30 cursor-not-allowed">
                                </div>

                                <div class="md:col-span-12">
                                    <label class="label-clean">Tipo de Operação</label>
                                    <div class="flex gap-3 items-center">
                                        <select id="f-type" class="input-clean cursor-pointer text-white"><option value="Primeira Entrada">Primeira Entrada</option><option value="Troca de Área">Troca de Área</option></select>
                                        <span id="f-typeLock" class="hidden text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl font-bold tracking-widest uppercase whitespace-nowrap"><i data-lucide="lock" class="w-3 h-3 inline mr-1"></i> Forçado pelo Histórico</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="relative pt-4">
                            <div class="absolute top-0 left-0 text-[9px] font-black text-mustard-500 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-mustard-500/20 shadow-md">2. Setup e Prazos</div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div><label class="label-clean">Setor</label><select id="f-sector" onchange="HA.UI.updateAreasFicha()" class="input-clean cursor-pointer" required></select></div>
                                <div><label class="label-clean">Área Específica</label><select id="f-area" class="input-clean cursor-pointer" required></select></div>
                                <div class="md:col-span-2"><label class="label-clean">Facilitador Responsável</label><select id="f-facilitator" class="input-clean cursor-pointer" required></select></div>
                                <div class="md:col-span-2"><label class="label-clean !text-indigo-400">Etapa Atual</label>
                                    <select id="f-stage" onchange="HA.UI.checkAutoFinish()" class="input-clean !border-indigo-500/50 text-indigo-300 font-bold bg-indigo-900/20 cursor-pointer shadow-[0_0_20px_rgba(79,70,229,0.15)]" required>
                                        <option value="Solicitado" class="hidden">Solicitado (Pendente)</option>
                                        <option value="1ª Etapa (Docs Iniciais)">1ª Etapa (Docs Iniciais)</option>
                                        <option value="2ª Etapa (ITs Pendentes)">2ª Etapa (ITs Pendentes)</option>
                                        <option value="Acompanhamento e Prática">Acompanhamento e Prática</option>
                                        <option value="Aguardando Exame Final">Aguardando Exame Final</option>
                                        <option value="Finalizado" class="bg-emerald-900 text-emerald-400">Finalizado (Sucesso)</option>
                                        <option value="Reprovado" class="bg-rose-900 text-rose-400">Reprovado</option>
                                    </select>
                                    <p class="text-[9px] text-gray-500 mt-2 ml-1">* Lembre-se de preencher o Checklist Automatizado antes de salvar como Finalizado.</p>
                                </div>
                                <div><label class="label-clean">Data Início</label><input type="date" id="f-startDate" onchange="HA.UI.calcMaxDate()" class="input-clean" required></div>
                                <div><label class="label-clean !text-mustard-400">Prazo Máximo</label><input type="date" id="f-endDate" readonly class="input-clean !text-mustard-400 !border-mustard-500/30 opacity-60 cursor-not-allowed"></div>
                            </div>
                        </div>

                        <div class="relative pt-4">
                            <div class="absolute top-0 left-0 text-[9px] font-black text-mustard-500 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-mustard-500/20 shadow-md">3. Práticas</div>
                            <div class="mt-2 bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                                <div class="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-4">
                                    <div class="w-full xl:w-auto flex-1"><label class="label-clean !text-indigo-400 !mb-2">Agendar com o Líder</label><input type="date" id="f-accDate" class="input-clean text-sm"></div>
                                    <div class="w-full xl:w-auto text-left xl:text-right flex flex-col xl:items-end">
                                        <span class="block text-[9px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Status do Líder</span>
                                        <span id="f-accBadge" class="text-[10px] font-bold px-3 py-1 rounded-lg uppercase border border-white/10 text-gray-400 mb-2 bg-white/5 inline-block">Não Agendado</span>
                                        <button type="button" id="f-btnReqAcc" onclick="HA.UI.requestAccDate()" class="w-full xl:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] px-4 py-2.5 rounded-xl transition uppercase tracking-widest shadow-md">Solicitar Aprovação</button>
                                        <input type="hidden" id="f-accStatus" value="Pendente">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    <div class="bg-white/5 p-5 rounded-2xl border border-white/5"><label class="flex items-center gap-3 mb-3 font-bold text-[10px] text-white uppercase tracking-widest cursor-pointer"><input type="checkbox" id="f-teoDone" class="w-4 h-4 accent-mustard-500 rounded bg-white/10 border-white/20"> Teórico Concluído</label><textarea id="f-teoNotes" rows="2" class="input-clean text-xs resize-none" placeholder="Relatório da teoria..."></textarea></div>
                                    <div class="bg-white/5 p-5 rounded-2xl border border-white/5"><label class="flex items-center gap-3 mb-3 font-bold text-[10px] text-white uppercase tracking-widest cursor-pointer"><input type="checkbox" id="f-praDone" class="w-4 h-4 accent-mustard-500 rounded bg-white/10 border-white/20"> Prático Concluído</label><textarea id="f-praNotes" rows="2" class="input-clean text-xs resize-none" placeholder="Relatório da prática..."></textarea></div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- COLUNA DIREITA -->
                <div class="w-full lg:w-1/2 p-8 space-y-8 flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0f172a]/30">
                    <div class="relative pt-4 flex-1 flex flex-col">
                        <div class="absolute top-0 left-0 text-[9px] font-black text-mustard-500 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-mustard-500/20 shadow-md">Diário de Ocorrências</div>
                        <div class="mt-2 bg-white/5 p-6 rounded-3xl border border-white/5 flex-1 flex flex-col shadow-inner">
                            <div class="flex gap-2"><input type="text" id="f-newProb" placeholder="Descreva um atraso, problema ou rejeição..." class="flex-1 input-clean"><button type="button" onclick="HA.UI.addProblemLog()" class="bg-white/10 text-white px-4 py-2.5 rounded-2xl hover:bg-white/20 transition border border-white/10 shadow-md"><i data-lucide="plus" class="w-5 h-5"></i></button></div>
                            <div id="f-problemsList" class="mt-5 space-y-3 overflow-y-auto custom-scroll pr-2 max-h-48"></div><input type="hidden" id="f-problemsDataStore">
                        </div>
                    </div>

                    <div class="relative pt-4">
                        <div class="absolute top-0 left-0 text-[9px] font-black text-mustard-500 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-mustard-500/20 shadow-md">Avaliação Final</div>
                        <div class="mt-2 bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner flex flex-col xl:flex-row justify-between items-center gap-6">
                            <div class="w-full xl:w-auto">
                                <label class="label-clean">Lançar Nota Oficial</label>
                                <div class="flex gap-3">
                                    <input type="number" id="f-newScore" min="0" max="100" class="w-24 input-clean font-black text-center text-xl placeholder-gray-700" placeholder="00">
                                    <button type="button" onclick="HA.UI.addAttempt()" id="f-btnScore" class="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg border border-emerald-500/50">Lançar</button>
                                </div>
                            </div>
                            <div id="f-attemptsList" class="flex gap-3 w-full xl:w-auto justify-center xl:justify-end"></div><input type="hidden" id="f-attemptsDataStore">
                        </div>
                    </div>

                    <div class="relative pt-4">
                        <div class="absolute top-0 left-0 text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-navy-900 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]">Checklist Automatizado</div>
                        <div class="mt-2 bg-emerald-900/10 p-6 rounded-3xl border border-emerald-500/20 space-y-4 shadow-inner">
                            <!-- PDF -->
                            <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div class="flex items-center gap-4"><div id="lockIconPdf" class="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20"><i data-lucide="x" class="w-4 h-4"></i></div><div><h4 class="text-sm font-bold text-white">Incubadora Assinada</h4><p id="lockTxtPdf" class="text-[9px] text-rose-400 uppercase tracking-widest font-bold mt-1">Pendente</p></div></div>
                                <div id="lockActionPdf" class="flex gap-2">
                                    <input type="file" id="f-pdfFile" accept="application/pdf" class="hidden" onchange="HA.UI.handlePdf()">
                                    <input type="hidden" id="f-pdfBase64">
                                    <button type="button" onclick="document.getElementById('f-pdfFile').click()" class="text-[10px] bg-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition border border-white/10 uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-md"><i data-lucide="file-up" class="w-4 h-4"></i> Anexar</button>
                                    <button type="button" id="f-btnUploadPdf" onclick="HA.UI.uploadPdf()" class="hidden text-[10px] bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-500 transition uppercase tracking-widest font-bold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"><i data-lucide="cloud-upload" class="w-4 h-4"></i> Nuvem</button>
                                </div>
                            </div>
                            <!-- Email -->
                            <div class="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div class="flex items-center gap-4"><div id="lockIconEmail" class="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20"><i data-lucide="x" class="w-4 h-4"></i></div><div><h4 class="text-sm font-bold text-white">Comunicado ao Líder</h4><p id="lockTxtEmail" class="text-[9px] text-rose-400 uppercase tracking-widest font-bold mt-1">Não Gerado</p></div></div>
                                <div id="lockActionEmail">
                                    <button type="button" onclick="HA.UI.generateEmail()" class="text-[10px] bg-indigo-600 border border-indigo-500/50 text-white px-4 py-3 rounded-xl hover:bg-indigo-500 transition uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)]"><i data-lucide="mail-check" class="w-4 h-4"></i> Enviar Oficial</button>
                                </div>
                            </div>
                            <input type="hidden" id="f-isPdfLocked" value="false"><input type="hidden" id="f-isEmailLocked" value="false">
                        </div>
                        <div id="timeBonoAlert" class="mt-4 hidden bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest animate-pulse"></div>
                    </div>
                </div>
            </div>
            
            <div class="bg-navy-950 p-6 flex justify-between items-center z-10 border-t border-white/10">
                <button type="button" onclick="alert('Funcionalidade de exclusão gerencial em desenvolvimento.')" class="px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 transition border border-rose-500/20 flex items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Cancelar Processo</button>
                <div class="flex gap-4">
                    <button type="button" onclick="HA.UI.closeModal('modalFichaContainer')" class="px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition">Fechar Dossiê</button>
                    <button type="button" onclick="HA.UI.saveTraining()" class="px-8 py-3.5 bg-gradient-to-r from-mustard-500 to-mustard-400 text-navy-950 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)] flex items-center gap-2"><i data-lucide="save" class="w-5 h-5"></i> Salvar na Nuvem</button>
                </div>
            </div>
        </div>`;
    },

    // 🔥 CORREÇÃO DE BUG (Segurança ao preencher o Colaborador)
    autoFillColab() {
        const id = document.getElementById('f-userId').value; 
        const c = HA.State.colabs.find(x => x.id.toString() === id.toString());
        if(c) {
            const imgEl = document.getElementById('f-colabPhoto');
            if(imgEl) {
                imgEl.src = c.photo ? c.photo : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
            }
            
            // Omitimos f-colabName, pois foi removido do design para ficar mais limpo
            const nameEl = document.getElementById('f-colabName');
            if(nameEl) nameEl.value = c.name; 
            
            document.getElementById('f-leader').value = c.leader || "Sem Líder Atribuído";
            
            const hasPrimeira = HA.State.trainings.some(t => t.userId.toString() === id.toString() && (t.type === 'Primeira Entrada' || t.stage === 'Finalizado'));
            const typeSelect = document.getElementById('f-type'); const lockIcon = document.getElementById('f-typeLock');
            
            if(hasPrimeira) { 
                typeSelect.value = 'Troca de Área'; typeSelect.classList.add('opacity-50'); typeSelect.style.pointerEvents = 'none'; lockIcon.classList.remove('hidden'); lockIcon.classList.add('inline-flex'); 
            } else { 
                typeSelect.value = 'Primeira Entrada'; typeSelect.classList.remove('opacity-50'); typeSelect.style.pointerEvents = 'auto'; lockIcon.classList.remove('inline-flex'); lockIcon.classList.add('hidden'); 
            }
        }
    },
    updateAreasFicha() {
        const s = document.getElementById('f-sector').value; const a = document.getElementById('f-area'); a.innerHTML = ''; 
        if(HA.Constants.Sectors[s]) HA.Constants.Sectors[s].forEach(ar => a.innerHTML += `<option value="${ar}">${ar}</option>`);
    },
    calcMaxDate() {
        const start = document.getElementById('f-startDate').value; if(!start) return;
        let d = new Date(start); d.setDate(d.getDate() + 15); document.getElementById('f-endDate').value = d.toISOString().split('T')[0];
    },

    requestAccDate() {
        const dt = document.getElementById('f-accDate').value; if(!dt) return alert("Selecione data antes de solicitar aprovação.");
        document.getElementById('f-accStatus').value = 'Aguardando Líder'; this.updateAccBadge('Aguardando Líder');
    },
    updateAccBadge(status) {
        const badge = document.getElementById('f-accBadge'); const btn = document.getElementById('f-btnReqAcc'); const dateInput = document.getElementById('f-accDate');
        if(!badge) return;
        dateInput.disabled = (status === 'Aguardando Líder' || status === 'Aprovado');
        if(!status || status === 'Pendente') { badge.innerText = "Não Agendado"; btn.classList.remove('hidden'); dateInput.classList.remove('opacity-50', 'cursor-not-allowed'); } 
        else if (status === 'Aguardando Líder') { badge.innerText = "Aguardando"; btn.classList.add('hidden'); dateInput.classList.add('opacity-50', 'cursor-not-allowed'); } 
        else if (status === 'Aprovado') { badge.innerText = "Aprovado"; btn.classList.add('hidden'); dateInput.classList.add('opacity-50', 'cursor-not-allowed'); } 
        else if (status === 'Recusado') { badge.innerText = "Recusado"; btn.classList.remove('hidden'); btn.innerText = `Reenviar`; dateInput.classList.remove('opacity-50', 'cursor-not-allowed'); }
    },
    addProblemLog() {
        const input = document.getElementById('f-newProb'); if(!input.value.trim()) return;
        this.currentProblemsLog.unshift({ date: new Date().toISOString(), text: input.value.trim() });
        input.value = ''; this.renderProblems();
    },
    renderProblems() {
        const list = document.getElementById('f-problemsList'); list.innerHTML = '';
        if(this.currentProblemsLog.length === 0) { list.innerHTML = '<div class="text-[10px] text-gray-500 italic mt-2 text-center">Nenhuma ocorrência registrada.</div>'; return; }
        this.currentProblemsLog.forEach(p => { list.innerHTML += `<div class="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 flex-shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div><div><p class="text-[9px] text-gray-500 font-mono mb-1">${this.formatDateBR(p.date)}</p><p class="text-xs text-gray-300 leading-tight">${p.text}</p></div></div>`; });
    },

    addAttempt() {
        const val = document.getElementById('f-newScore').value; 
        if(val === '' || val < 0 || val > 100) return alert('Nota inválida. Digite de 0 a 100.');
        if(this.currentExamAttempts.length >= 3) return alert('Máximo de 3 tentativas já atingido.');
        
        const score = parseInt(val);
        this.currentExamAttempts.push({ score: score, date: new Date().toISOString() }); 
        document.getElementById('f-newScore').value = ''; 
        this.renderAttempts();
        
        const stageSel = document.getElementById('f-stage');
        
        if(score >= 70) { 
            stageSel.value = 'Finalizado'; 
            alert("🎉 Nota aprovatória!"); 
            this.checkAutoFinish(); 
        } 
        else {
            if (this.currentExamAttempts.length >= 3) { 
                stageSel.value = 'Reprovado'; 
                alert("❌ Reprovado definitivo (3 tentativas esgotadas)."); 
            } else {
                document.getElementById('f-accDate').value = '';
                document.getElementById('f-accStatus').value = 'Pendente';
                document.getElementById('f-accDate').disabled = false;
                
                const btnReq = document.getElementById('f-btnReqAcc');
                btnReq.classList.remove('hidden');
                btnReq.innerText = "Solicitar Nova Data";
                
                const badge = document.getElementById('f-accBadge');
                badge.innerText = "Reagendar";
                badge.className = "text-[10px] font-bold px-3 py-1 rounded-lg uppercase border border-rose-500/30 text-rose-400 mb-2 bg-rose-500/10 inline-block animate-pulse";
                
                this.currentProblemsLog.unshift({ 
                    date: new Date().toISOString(), 
                    text: `AVISO: Colaborador reprovado na tentativa ${this.currentExamAttempts.length} com nota ${score}. Agendamento prático resetado pelo sistema.` 
                });
                this.renderProblems();
                
                stageSel.value = 'Acompanhamento e Prática';
                
                alert(`⚠️ Nota ${score} (Reprovatória).\n\nO sistema resetou o agendamento de acompanhamento.\nPor favor, proponha uma nova data e solicite aprovação ao líder novamente.`);
            }
        }
    },

    renderAttempts() {
        const container = document.getElementById('f-attemptsList'); container.innerHTML = ''; let passed = false;
        for(let i=0; i<3; i++) {
            if(i < this.currentExamAttempts.length) {
                let score = this.currentExamAttempts[i].score; if(score>=70) passed = true; let color = score >= 70 ? 'emerald' : (i===0 ? 'mustard' : (i===1 ? 'orange' : 'rose'));
                container.innerHTML += `<div class="bg-${color}-500/10 border border-${color}-500/30 p-3 rounded-2xl text-center min-w-[60px] shadow-inner"><div class="text-[9px] font-black text-${color}-400 uppercase mb-1 tracking-widest">T${i+1}</div><div class="text-lg font-black text-white">${score}</div></div>`;
            } else { container.innerHTML += `<div class="bg-white/5 border border-white/10 border-dashed p-3 rounded-2xl text-center min-w-[60px] opacity-40"><div class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">T${i+1}</div><div class="text-lg font-light text-gray-600">--</div></div>`; }
        }
        const btn = document.getElementById('f-btnScore'); const inp = document.getElementById('f-newScore');
        if(passed || this.currentExamAttempts.length >= 3) { btn.disabled = true; inp.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); } else { btn.disabled = false; inp.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); }
    },

    checkAutoFinish() {
        const stage = document.getElementById('f-stage').value; 
        const finDateInput = document.getElementById('f-finalizationDate'); 
        const alertBox = document.getElementById('timeBonoAlert');
        
        if(stage === 'Finalizado') {
            if(!finDateInput.value) finDateInput.value = new Date().toISOString().split('T')[0]; 
            
            const start = this.parseDate(document.getElementById('f-startDate').value); 
            const end = this.parseDate(finDateInput.value); 
            
            if(start && end) {
                start.setHours(0,0,0,0);
                end.setHours(0,0,0,0);
                const diffDays = Math.floor((end - start) / (1000 * 3600 * 24));
                
                if(diffDays <= 16 && diffDays >= 0) { 
                    alertBox.innerHTML = `<i data-lucide="trophy" class="w-5 h-5 inline mb-0.5 mr-2"></i> Excelente! Treinamento finalizado <b>${16 - diffDays} dia(s) antes do prazo.</b>`; 
                    alertBox.classList.remove('hidden'); 
                }
            }
        } else { 
            finDateInput.value = ''; 
            alertBox.classList.add('hidden'); 
        }
        lucide.createIcons();
    },

    resetLockVisuals(type) {
        document.getElementById('f-is'+type+'Locked').value = 'false';
        const icon = document.getElementById('lockIcon'+type); const txt = document.getElementById('lockTxt'+type); const act = document.getElementById('lockAction'+type);
        icon.className = "w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20"; icon.innerHTML = '<i data-lucide="x" class="w-4 h-4"></i>';
        txt.innerText = "Pendente"; txt.className = "text-[9px] text-rose-400 uppercase tracking-widest font-bold mt-1";
        if(type==='Pdf') act.innerHTML = `<input type="file" id="f-pdfFile" accept="application/pdf" class="hidden" onchange="HA.UI.handlePdf()"><input type="hidden" id="f-pdfBase64"><button type="button" onclick="document.getElementById('f-pdfFile').click()" class="text-[10px] bg-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition border border-white/10 uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-md"><i data-lucide="file-up" class="w-4 h-4"></i> Anexar</button><button type="button" id="f-btnUploadPdf" onclick="HA.UI.uploadPdf()" class="hidden text-[10px] bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-500 transition uppercase tracking-widest font-bold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"><i data-lucide="cloud-upload" class="w-4 h-4"></i> Nuvem</button>`;
        if(type==='Email') act.innerHTML = `<button type="button" onclick="HA.UI.generateEmail()" class="text-[10px] bg-indigo-600 border border-indigo-500/50 text-white px-4 py-3 rounded-xl hover:bg-indigo-500 transition uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.4)]"><i data-lucide="mail-check" class="w-4 h-4"></i> Enviar Oficial</button>`;
        lucide.createIcons();
    },
    setLockState(type) {
        document.getElementById('f-is'+type+'Locked').value = 'true';
        const icon = document.getElementById('lockIcon'+type); const txt = document.getElementById('lockTxt'+type); const act = document.getElementById('lockAction'+type);
        icon.className = "w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]"; icon.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-emerald-400"></i>';
        txt.innerText = "Salvo / Gerado"; txt.className = "text-[9px] text-emerald-400 uppercase tracking-widest font-bold mt-1";
        act.innerHTML = '<span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> Concluído</span>';
        lucide.createIcons();
    },

    handlePdf() {
        const file = document.getElementById('f-pdfFile').files[0]; if(!file) return;
        if(file.type !== "application/pdf") return alert("Apenas arquivos PDF são aceitos pela Inteligência Artificial.");
        const reader = new FileReader(); reader.onload = function(event) { document.getElementById('f-pdfBase64').value = event.target.result.split(',')[1]; document.getElementById('f-btnUploadPdf').classList.remove('hidden'); }; reader.readAsDataURL(file);
    },
    
    async uploadPdf() {
        const base64 = document.getElementById('f-pdfBase64').value; 
        const idColab = document.getElementById('f-userId').value;
        const cObj = HA.State.colabs.find(c => c.id.toString() === idColab.toString());
        const colabName = cObj ? cObj.name : "Desconhecido";
        
        const area = document.getElementById('f-area').value; 
        
        if(!this.currentEditingId) return alert("Salve a ficha no botão azul inferior ANTES de anexar o PDF na nuvem.");
        if(!base64) return;
        
        HA.Api.showLoad("Enviando Incubadora para o SharePoint...");
        const payload = { nomeColaborador: colabName, nomeArquivo: `Roteiro - ${area} - ${colabName}.pdf`, area: area, conteudoBase64: base64 };
        
        try {
            const res = await fetch(HA.Config.URL_UPLOAD_PDF, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if(!res.ok) throw new Error("Status " + res.status);
            
            HA.Api.hideLoad();
            alert("✅ Incubadora enviada e salva no SharePoint com Sucesso!"); 
            this.setLockState('Pdf'); 
            const t = HA.State.trainings.find(x => x.id.toString() === this.currentEditingId.toString()); 
            if(t) { t.pdfUploaded = true; HA.Data.safeSave(t); }

        } catch(err) {
            if(err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
                HA.Api.hideLoad();
                alert("✅ Incubadora enviada com Sucesso para o SharePoint!"); 
                this.setLockState('Pdf');
                const t = HA.State.trainings.find(x => x.id.toString() === this.currentEditingId.toString()); 
                if(t) { t.pdfUploaded = true; HA.Data.safeSave(t); }
            } else {
                HA.Api.hideLoad(); alert("Erro ao enviar PDF: " + err.message);
            }
        }
    },

    async generateEmail() {
        if(!this.currentEditingId) return alert("Salve a ficha no botão inferior ANTES de enviar o E-mail Oficial.");
        
        const t = HA.State.trainings.find(x => x.id.toString() === this.currentEditingId.toString()); if(!t) return;
        const arrProbs = Array.isArray(t.problemsLog) ? t.problemsLog : []; 
        const obsTexto = arrProbs.length > 0 ? arrProbs.map(p=>p.text).join(' | ') : 'Nenhuma ocorrência registrada.';
        const liderNome = t.leader ? t.leader.split(' ')[0] : 'Líder';

        HA.Api.showLoad("Disparando Comunicação Oficial...");

        const payloadEmail = {
            colabName: t.colabName, userId: t.userId.toString(), leader: t.leader, area: t.area,
            score: t.score ? parseInt(t.score) : 0,
            endDate: (t.finalizationDate || t.endDate || new Date().toISOString()).split('T')[0],
            problems: obsTexto, teoNotes: t.teoNotes || "N/A", praNotes: t.praNotes || "N/A"
        };

        try {
            const res = await fetch(HA.Config.URL_ENVIAR_EMAIL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadEmail) });
            if(!res.ok) throw new Error("Status " + res.status);
            
            HA.Api.hideLoad(); this.setLockState('Email'); 
            alert("✅ E-mail corporativo enviado com sucesso ao Líder " + liderNome); 
            t.emailSent = true; HA.Data.safeSave(t); 

        } catch(err) {
            if(err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
                HA.Api.hideLoad(); this.setLockState('Email'); 
                alert("✅ E-mail corporativo disparado com sucesso ao Líder " + liderNome); 
                t.emailSent = true; HA.Data.safeSave(t);
            } else {
                HA.Api.hideLoad(); alert("Erro ao enviar E-mail: " + err.message);
            }
        }
    },

    saveTraining() {
        const uid = document.getElementById('f-userId').value; if(!uid) return alert("Matrícula de Colaborador é obrigatória.");
        
        const stage = document.getElementById('f-stage').value;
        const isPdfLocked = document.getElementById('f-isPdfLocked').value === 'true';
        const isEmailLocked = document.getElementById('f-isEmailLocked').value === 'true';

        if (stage === 'Finalizado') {
            if (!isPdfLocked || !isEmailLocked) {
                alert("🛑 AÇÃO BLOQUEADA PELO SISTEMA:\n\nVocê não pode salvar este treinamento como 'Finalizado' sem antes completar o Checklist Automatizado:\n\n1. Anexar e enviar a Incubadora Assinada (PDF) para a nuvem.\n2. Enviar o E-mail Oficial de Comunicação ao Líder.\n\nPor favor, cumpra esses passos antes de salvar.");
                return; 
            }
        }

        const id = this.currentEditingId ? this.currentEditingId : Date.now();
        let finalScore = 0; if(this.currentExamAttempts.length > 0) finalScore = this.currentExamAttempts[this.currentExamAttempts.length - 1].score;
        const colabObj = HA.State.colabs.find(c => c.id.toString() === uid.toString());

        const tr = {
            id: id, 
            spId: document.getElementById('f-spId').value, 
            userId: uid, 
            colabName: colabObj ? colabObj.name : 'Desconhecido',
            leader: document.getElementById('f-leader').value, 
            type: document.getElementById('f-type').value, 
            sector: document.getElementById('f-sector').value, 
            area: document.getElementById('f-area').value, 
            facilitator: document.getElementById('f-facilitator').value,
            stage: stage, 
            startDate: document.getElementById('f-startDate').value, 
            endDate: document.getElementById('f-endDate').value,
            accRequestDate: document.getElementById('f-accDate').value, 
            accRequestStatus: document.getElementById('f-accStatus').value,
            accTeoDone: document.getElementById('f-teoDone').checked, 
            accPraDone: document.getElementById('f-praDone').checked,
            teoNotes: document.getElementById('f-teoNotes').value, 
            praNotes: document.getElementById('f-praNotes').value,
            problemsLog: [...this.currentProblemsLog], 
            examAttempts: [...this.currentExamAttempts], 
            score: finalScore,
            pdfUploaded: isPdfLocked, 
            emailSent: isEmailLocked,
            finalizationDate: document.getElementById('f-finalizationDate').value
        };

        HA.Data.safeSave(tr).then(success => { 
            if(success) { 
                this.closeModal('modalFichaContainer'); 
                alert("✅ Dossiê Salvo no SharePoint com sucesso!"); 
            }
        });
    }
};
