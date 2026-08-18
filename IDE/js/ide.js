(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const els = {
    newProjectBtn: $("#newProjectBtn"), openProjectBtn: $("#openProjectBtn"), saveBtn: $("#saveBtn"), saveAsBtn: $("#saveAsBtn"),
    compileBtn: $("#compileBtn"), runBtn: $("#runBtn"), newFileBtn: $("#newFileBtn"),
    treeNewFileBtn: $("#treeNewFileBtn"), deleteFileBtn: $("#deleteFileBtn"), setMainBtn: $("#setMainBtn"),
    previewBtn: $("#previewBtn"), addDbBtn: $("#addDbBtn"), addAuthBtn: $("#addAuthBtn"), refreshFilesBtn: $("#refreshFilesBtn"),
    mainClassInput: $("#mainClassInput"), activeProjectLabel: $("#activeProjectLabel"), projectTree: $("#projectTree"),
    activeFileBadge: $("#activeFileBadge"), designView: $("#designView"), sourceView: $("#sourceView"),
    designerWrap: $("#designerWrap"), nonFormNotice: $("#nonFormNotice"), fakeWindow: $("#fakeWindow"), canvas: $("#canvas"),
    emptyCanvas: $("#emptyCanvas"), currentFileLabel: $("#currentFileLabel"), codeEditor: $("#codeEditor"),
    foldedCodeView: $("#foldedCodeView"), foldModeBtn: $("#foldModeBtn"), collapseGeneratedBtn: $("#collapseGeneratedBtn"), expandAllCodeBtn: $("#expandAllCodeBtn"),
    generateBtn: $("#generateBtn"), copyBtn: $("#copyBtn"), framePropertiesPanel: $("#framePropertiesPanel"),
    componentPanel: $("#componentPanel"), className: $("#className"), frameTitle: $("#frameTitle"),
    frameWidth: $("#frameWidth"), frameHeight: $("#frameHeight"), frameBackground: $("#frameBackground"), frameResizable: $("#frameResizable"), frameTitleDisplay: $("#frameTitleDisplay"),
    noSelection: $("#noSelection"), componentProps: $("#componentProps"), propType: $("#propType"),
    propName: $("#propName"), propText: $("#propText"), propX: $("#propX"), propY: $("#propY"),
    propW: $("#propW"), propH: $("#propH"), propFontFamily: $("#propFontFamily"), propFontStyle: $("#propFontStyle"),
    propFontSize: $("#propFontSize"), propForeground: $("#propForeground"), propBackground: $("#propBackground"), propOpaque: $("#propOpaque"),
    iconEditorBlock: $("#iconEditorBlock"), propIconPath: $("#propIconPath"), chooseIconBtn: $("#chooseIconBtn"), clearIconBtn: $("#clearIconBtn"),
    actionTargetLabel: $("#actionTargetLabel"), propActionTarget: $("#propActionTarget"), buttonEventsBlock: $("#buttonEventsBlock"),
    propActionHandler: $("#propActionHandler"), openEventHandlerBtn: $("#openEventHandlerBtn"), deleteComponentBtn: $("#deleteComponentBtn"),
    componentNavigator: $("#componentNavigator"), bringToFrontBtn: $("#bringToFrontBtn"), moveForwardBtn: $("#moveForwardBtn"),
    moveBackwardBtn: $("#moveBackwardBtn"), sendToBackBtn: $("#sendToBackBtn"),
    dbHost: $("#dbHost"), dbPort: $("#dbPort"), dbName: $("#dbName"), dbUser: $("#dbUser"), dbPass: $("#dbPass"), dbUsersTable: $("#dbUsersTable"),
    generateAuthBtn: $("#generateAuthBtn"), testDbBtn: $("#testDbBtn"), outputPanel: $("#outputPanel"), toggleOutputBtn: $("#toggleOutputBtn"),
    maximizeOutputBtn: $("#maximizeOutputBtn"), clearOutputBtn: $("#clearOutputBtn"), output: $("#output"),
    eventEditNotice: $("#eventEditNotice"), eventEditTitle: $("#eventEditTitle"), eventEditText: $("#eventEditText"), closeEventNoticeBtn: $("#closeEventNoticeBtn"),
    modal: $("#modal"), modalTitle: $("#modalTitle"), modalBody: $("#modalBody"), modalClose: $("#modalClose")
  };

  const STORAGE_KEY = "javaJFramePracticeIDE.projects.v3";
  const OLD_STORAGE_KEY = "javaJFramePracticeIDE.projects.v2";

  const state = {
    projectName: "",
    currentFile: "MainForm.java",
    mainClass: "MainForm",
    files: {},
    forms: {},
    selectedId: null,
    dirty: false,
    foldView: false,
    activeView: "design",
    uiState: {},
    saveFileHandle: null
  };

  let autoSaveTimer = null;

  const componentDefaults = {
    JLabel:{prefix:"jLabel",text:"Label",w:100,h:28}, JTextField:{prefix:"jTextField",text:"",w:170,h:30},
    JPasswordField:{prefix:"jPasswordField",text:"",w:170,h:30}, JButton:{prefix:"jButton",text:"Button",w:110,h:34},
    JCheckBox:{prefix:"jCheckBox",text:"Check Box",w:130,h:28}, JRadioButton:{prefix:"jRadioButton",text:"Radio Button",w:140,h:28},
    JTextArea:{prefix:"jTextArea",text:"",w:210,h:90}, JComboBox:{prefix:"jComboBox",text:"Item 1, Item 2",w:155,h:32},
    JTable:{prefix:"jTable",text:"Column 1, Column 2",w:260,h:120}
  };

  function log(message, type="info") {
    const stamp = new Date().toLocaleTimeString();
    const prefix = type === "error" ? "[ERROR]" : type === "success" ? "[OK]" : "[INFO]";
    els.output.textContent += `\n${stamp} ${prefix} ${message}`;
    els.output.scrollTop = els.output.scrollHeight;
  }
  function replaceOutput(message){ els.output.textContent = message; }
  function setDirty(v=true){
    state.dirty=v;
    document.title=`${v?"* ":""}Java JFrame Practice IDE`;
    if(v) scheduleAutoSave();
  }
  function safeClassName(v){ let s=String(v||"MainForm").replace(/[^A-Za-z0-9_$]/g,"").replace(/^[^A-Za-z_$]+/,""); return s||"MainForm"; }
  function safeVariableName(v,f="component1"){ let s=String(v||"").trim().replace(/[^A-Za-z0-9_$]/g,"").replace(/^[^A-Za-z_$]+/,""); return s||f; }
  function escapeJava(v){ return String(v??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g,"\\n"); }
  function escapeHtml(v){ return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
  function classFromFile(name){ return safeClassName(String(name||"MainForm.java").replace(/\.java$/i,"")); }
  function safeSqlIdentifier(v,fallback="users"){ const s=String(v||"").trim().replace(/[^A-Za-z0-9_]/g,""); return s||fallback; }
  function usersTable(){ return safeSqlIdentifier(els.dbUsersTable?.value||"users","users"); }
  function databaseName(){ return safeSqlIdentifier(els.dbName?.value||"student_system","student_system"); }
  function isFormFile(name=state.currentFile){ return !!state.forms[name]; }
  function currentForm(){ return state.forms[state.currentFile] || null; }
  function javaFiles(){ return Object.keys(state.files).filter(n=>n.toLowerCase().endsWith(".java")); }
  function formFiles(){ return Object.keys(state.forms); }

  function getProjects(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");}catch{return{};} }
  function putProjects(v){ localStorage.setItem(STORAGE_KEY,JSON.stringify(v)); }

  function currentViewName(){ return els.sourceView?.classList.contains("active") ? "source" : "design"; }
  function captureCurrentFileUI(){
    if(!state.projectName || !state.currentFile) return;
    state.uiState[state.currentFile]={
      view: currentViewName(),
      selectionStart: Number(els.codeEditor?.selectionStart)||0,
      selectionEnd: Number(els.codeEditor?.selectionEnd)||0,
      codeScrollTop: Number(els.codeEditor?.scrollTop)||0,
      designerScrollTop: Number(els.designerWrap?.scrollTop)||0,
      designerScrollLeft: Number(els.designerWrap?.scrollLeft)||0
    };
  }
  function restoreCurrentFileUI(preferDesign=false){
    const ui=state.uiState[state.currentFile]||{};
    let view=ui.view;
    if(!isFormFile()) view="source";
    else if(!view) view=preferDesign?"design":"design";
    switchView(view||"design",false);
    requestAnimationFrame(()=>{
      if(els.codeEditor){
        const max=els.codeEditor.value.length;
        const a=Math.max(0,Math.min(max,Number(ui.selectionStart)||0));
        const b=Math.max(a,Math.min(max,Number(ui.selectionEnd)||a));
        els.codeEditor.setSelectionRange(a,b);
        els.codeEditor.scrollTop=Number(ui.codeScrollTop)||0;
      }
      if(els.designerWrap){
        els.designerWrap.scrollTop=Number(ui.designerScrollTop)||0;
        els.designerWrap.scrollLeft=Number(ui.designerScrollLeft)||0;
      }
    });
  }
  function projectSnapshot(){
    captureCurrentFileUI();
    return {
      format:"JavaJFramePracticeIDE", version:4, name:state.projectName, currentFile:state.currentFile, mainClass:state.mainClass,
      files:state.files, forms:state.forms, uiState:state.uiState, activeView:currentViewName(), savedAt:new Date().toISOString()
    };
  }
  function persistProjectQuietly(){
    if(!state.projectName) return;
    try{
      const projects=getProjects(); projects[state.projectName]=projectSnapshot(); putProjects(projects);
    }catch(e){ console.warn("Autosave failed",e); }
  }
  function scheduleAutoSave(){
    clearTimeout(autoSaveTimer);
    autoSaveTimer=setTimeout(()=>{ persistProjectQuietly(); },700);
  }

  function migrateOldProjects(){
    if(localStorage.getItem(STORAGE_KEY)) return;
    let old={}; try{old=JSON.parse(localStorage.getItem(OLD_STORAGE_KEY)||"{}");}catch{}
    if(!Object.keys(old).length) return;
    const migrated={};
    Object.entries(old).forEach(([name,p])=>{
      const className=safeClassName(p?.frame?.className||"MainForm");
      const file=`${className}.java`;
      migrated[name]={
        name, currentFile:p.currentFile||file, mainClass:safeClassName(p?.frame?.mainClass||className), files:p.files||{},
        forms:{[file]:{className,title:p?.frame?.title||"Main Form",width:Number(p?.frame?.width)||760,height:Number(p?.frame?.height)||500,components:Array.isArray(p.components)?p.components:[],counter:Number(p.counter)||0}},
        savedAt:p.savedAt||new Date().toISOString()
      };
      if(!migrated[name].files[file]) migrated[name].files[file]="";
    });
    putProjects(migrated);
  }

  function syncEditor(){ if(state.projectName && state.currentFile) state.files[state.currentFile]=els.codeEditor.value; }

  function findMatchingBrace(source, openIndex){
    if(openIndex<0 || source[openIndex]!=='{') return -1;
    let depth=1, mode='code';
    for(let i=openIndex+1;i<source.length;i++){
      const ch=source[i], next=source[i+1];
      if(mode==='line'){ if(ch==='\n') mode='code'; continue; }
      if(mode==='block'){ if(ch==='*'&&next==='/'){ mode='code'; i++; } continue; }
      if(mode==='string'){ if(ch==='\\'){ i++; continue; } if(ch==='"') mode='code'; continue; }
      if(mode==='char'){ if(ch==='\\'){ i++; continue; } if(ch==="'") mode='code'; continue; }
      if(ch==='/'&&next==='/'){ mode='line'; i++; continue; }
      if(ch==='/'&&next==='*'){ mode='block'; i++; continue; }
      if(ch==='"'){ mode='string'; continue; }
      if(ch==="'"){ mode='char'; continue; }
      if(ch==='{') depth++;
      else if(ch==='}'){ depth--; if(depth===0) return i; }
    }
    return -1;
  }

  function parseJavaFoldSections(source){
    source=String(source||'');
    if(!source.trim()) return [];

    const classMatch=/\bpublic\s+class\s+([A-Za-z_$][\w$]*)/.exec(source);
    const className=classMatch?classMatch[1]:classFromFile(state.currentFile);
    const methodRegex=/^[ \t]*(public|private|protected)\s+(?:(?:static|final|synchronized|abstract)\s+)*(?:(?:[A-Za-z_$][\w$<>\[\],.?]*?)\s+)?([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*\{/gm;
    const methods=[];
    let match;
    while((match=methodRegex.exec(source))){
      const open=source.indexOf('{',match.index+match[0].lastIndexOf('{'));
      const close=findMatchingBrace(source,open);
      if(close<0) continue;
      const name=match[2];
      methods.push({start:match.index,end:close+1,name,text:source.slice(match.index,close+1)});
      methodRegex.lastIndex=close+1;
    }

    const sections=[];
    const firstMethod=methods.length?methods[0].start:source.length;
    const classIndex=classMatch?classMatch.index:-1;

    if(classIndex>0){
      const imports=source.slice(0,classIndex).trimEnd();
      if(imports.trim()) sections.push({kind:'generated',name:'imports',label:'Imports / Package',start:0,end:classIndex,text:imports,generated:true,open:false});
      const fields=source.slice(classIndex,firstMethod).trimEnd();
      if(fields.trim()) sections.push({kind:'generated',name:'fields',label:'Class Declaration / Fields',start:classIndex,end:firstMethod,text:fields,generated:true,open:false});
    }else if(firstMethod>0){
      const preamble=source.slice(0,firstMethod).trimEnd();
      if(preamble.trim()) sections.push({kind:'generated',name:'preamble',label:'Class / Fields',start:0,end:firstMethod,text:preamble,generated:true,open:false});
    }

    methods.forEach(m=>{
      let kind='method', label=`Method: ${m.name}`, generated=false, open=true;
      if(m.name===className){ kind='generated'; label='Generated UI / Constructor'; generated=true; open=false; }
      else if(/ActionPerformed$/.test(m.name)){ kind='event'; label=`⚡ Event: ${m.name}`; open=true; }
      else if(m.name==='main'){ kind='generated'; label='Main Method'; generated=true; open=false; }
      else if(/^(authenticateUser|registerUser|getConnection|hashPassword|verifyPassword|generateSalt|constantTimeEquals)$/.test(m.name)){
        kind='helper'; label=`Database / Helper: ${m.name}`; open=true;
      }else if(/^(initComponents|createUI|buildUI)$/.test(m.name)){
        kind='generated'; label=`Generated Code: ${m.name}`; generated=true; open=false;
      }
      sections.push({...m,kind,label,generated,open});
    });

    const lastEnd=methods.length?methods[methods.length-1].end:firstMethod;
    const tail=source.slice(lastEnd).trim();
    if(tail && tail!=='}') sections.push({kind:'generated',name:'tail',label:'Class Closing / Remaining Code',start:lastEnd,end:source.length,text:source.slice(lastEnd),generated:true,open:false});
    return sections;
  }

  function focusFullSource(start=0,end=start){
    setFoldView(false);
    switchView('source');
    requestAnimationFrame(()=>{
      const max=els.codeEditor.value.length;
      const a=Math.max(0,Math.min(max,Number(start)||0));
      const b=Math.max(a,Math.min(max,Number(end)||a));
      els.codeEditor.focus();
      els.codeEditor.setSelectionRange(a,b);
      const line=els.codeEditor.value.slice(0,a).split('\n').length-1;
      const lineHeight=parseFloat(getComputedStyle(els.codeEditor).lineHeight)||21.7;
      els.codeEditor.scrollTop=Math.max(0,line*lineHeight-110);
      els.codeEditor.classList.remove('source-jump-flash');
      void els.codeEditor.offsetWidth;
      els.codeEditor.classList.add('source-jump-flash');
    });
  }

  function saveInlineFoldSection(section,newText,index){
    const source=els.codeEditor.value||'';
    const start=Math.max(0,Math.min(source.length,Number(section.start)||0));
    const end=Math.max(start,Math.min(source.length,Number(section.end)||start));
    const updated=source.slice(0,start)+newText+source.slice(end);

    els.codeEditor.value=updated;
    if(state.projectName&&state.currentFile)state.files[state.currentFile]=updated;

    const form=currentForm();
    if(form){
      captureEditedEventBodies(form,updated);
      captureEditedHelperMethod(form,updated);
    }

    captureCurrentFileUI();
    setDirty(true);
    scheduleAutoSave();
    renderFoldedCode({focusHandler:section.name||'',focusIndex:index});
    log(`Saved changes to ${section.label}.`,'success');
  }

  function openInlineFoldEditor(details,section,index){
    if(details.dataset.editing==='true')return;
    details.dataset.editing='true';
    details.open=true;

    const pre=details.querySelector('.fold-code');
    if(!pre)return;
    pre.classList.add('hidden');

    const editorWrap=document.createElement('div');
    editorWrap.className='fold-inline-editor';

    const help=document.createElement('div');
    help.className=`fold-inline-help ${section.generated?'generated-warning':''}`;
    help.textContent=section.generated
      ? 'You are editing generated code directly. Design changes may regenerate this section later.'
      : 'Edit only this section here. Save Section updates the full Java file without leaving Code Folding View.';

    const textarea=document.createElement('textarea');
    textarea.className='fold-inline-textarea';
    textarea.spellcheck=false;
    textarea.value=section.text||'';
    textarea.setAttribute('aria-label',`Edit ${section.label}`);

    const actions=document.createElement('div');
    actions.className='fold-inline-actions';
    const save=document.createElement('button');
    save.type='button'; save.className='fold-save-btn'; save.textContent='Save Section';
    const cancel=document.createElement('button');
    cancel.type='button'; cancel.className='fold-cancel-btn'; cancel.textContent='Cancel';
    const full=document.createElement('button');
    full.type='button'; full.className='fold-full-source-btn'; full.textContent='Open Full Source';
    actions.append(save,cancel,full);
    editorWrap.append(help,textarea,actions);
    details.appendChild(editorWrap);

    const closeEditor=()=>{
      details.dataset.editing='false';
      editorWrap.remove();
      pre.classList.remove('hidden');
    };
    save.onclick=()=>saveInlineFoldSection(section,textarea.value,index);
    cancel.onclick=closeEditor;
    full.onclick=()=>focusFullSource(section.start,section.end);
    textarea.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveInlineFoldSection(section,textarea.value,index);}
      else if(e.key==='Escape'){e.preventDefault();closeEditor();}
    });

    requestAnimationFrame(()=>{
      textarea.focus();
      const firstEditable=Math.min(textarea.value.length,Math.max(0,textarea.value.indexOf('{')+1));
      textarea.setSelectionRange(firstEditable,firstEditable);
      details.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  }

  function renderFoldedCode({focusHandler='',focusIndex=-1}={}){
    if(!els.foldedCodeView) return;
    const source=els.codeEditor.value||'';
    const sections=parseJavaFoldSections(source);
    els.foldedCodeView.innerHTML='';

    const intro=document.createElement('div');
    intro.className='folded-code-note';
    intro.innerHTML='<strong>Code Folding View</strong><span>Edit an event, database/helper method, imports, or generated section directly on this page. Click <b>Edit Here</b>, change only that section, then click <b>Save Section</b>.</span>';
    els.foldedCodeView.appendChild(intro);

    if(!sections.length){
      const empty=document.createElement('div'); empty.className='empty'; empty.textContent='No foldable Java code was found.'; els.foldedCodeView.appendChild(empty); return;
    }

    sections.forEach((section,index)=>{
      const details=document.createElement('details');
      details.className=`code-fold-section fold-${section.kind}`;
      details.dataset.generated=section.generated?'true':'false';
      details.dataset.name=section.name||'';
      details.dataset.index=String(index);
      details.dataset.start=String(section.start);
      details.dataset.end=String(section.end);
      details.open=focusHandler ? section.name===focusHandler : (focusIndex===index ? true : section.open);

      const summary=document.createElement('summary');
      const title=document.createElement('span'); title.className='fold-summary-title'; title.textContent=section.label;
      const meta=document.createElement('span'); meta.className='fold-summary-meta'; meta.textContent=`${String(section.text||'').split('\n').length} lines`;
      const edit=document.createElement('button'); edit.type='button'; edit.className='fold-edit-btn'; edit.textContent='Edit Here'; edit.title='Edit only this section without leaving Code Folding View';
      edit.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openInlineFoldEditor(details,section,index);});
      summary.append(title,meta,edit);

      const pre=document.createElement('pre'); pre.className='fold-code'; pre.textContent=section.text||'';
      details.append(summary,pre);
      els.foldedCodeView.appendChild(details);
    });

    if(focusHandler||focusIndex>=0){
      requestAnimationFrame(()=>{
        let target=null;
        if(focusHandler)target=[...els.foldedCodeView.querySelectorAll('.code-fold-section')].find(d=>d.dataset.name===focusHandler);
        if(!target&&focusIndex>=0)target=els.foldedCodeView.querySelector(`.code-fold-section[data-index="${focusIndex}"]`);
        if(target){ target.open=true; target.scrollIntoView({block:'center',behavior:'smooth'}); }
      });
    }
  }

  function setFoldView(enabled,{focusHandler=''}={}){
    state.foldView=!!enabled;
    if(state.foldView){
      renderFoldedCode({focusHandler});
      els.foldedCodeView?.classList.remove('hidden');
      els.codeEditor.classList.add('hidden');
      if(els.foldModeBtn) els.foldModeBtn.textContent='▴ Code Folding: On';
    }else{
      els.foldedCodeView?.classList.add('hidden');
      els.codeEditor.classList.remove('hidden');
      if(els.foldModeBtn) els.foldModeBtn.textContent='▾ Code Folding';
    }
  }

  function toggleFoldView(){ setFoldView(!state.foldView); }

  function collapseGeneratedCode(){
    if(!state.foldView) setFoldView(true);
    else renderFoldedCode();
    els.foldedCodeView?.querySelectorAll('.code-fold-section').forEach(details=>{
      details.open=details.dataset.generated!=='true';
    });
    log('Generated code minimized. Event and database/helper sections remain expanded.','success');
  }

  function expandAllCode(){
    if(!state.foldView) setFoldView(true);
    else renderFoldedCode();
    els.foldedCodeView?.querySelectorAll('.code-fold-section').forEach(details=>details.open=true);
    log('All code sections expanded.','success');
  }
  function serializeProject(){
    if(isFormFile()) {
      syncFormFromInputs();
      syncGeneratedSourceFromDesign();
    } else syncEditor();
    return projectSnapshot();
  }
  function unwrapProjectData(data){
    if(data && data.project && typeof data.project==="object") return data.project;
    return data||{};
  }
  function defaultAppearance(type){
    const backgrounds={JLabel:"#f3f3f3",JTextField:"#ffffff",JPasswordField:"#ffffff",JButton:"#f0f0f0",JCheckBox:"#f3f3f3",JRadioButton:"#f3f3f3",JTextArea:"#ffffff",JComboBox:"#ffffff",JTable:"#ffffff"};
    return {fontFamily:"Arial",fontStyle:"plain",fontSize:14,foreground:"#000000",background:backgrounds[type]||"#f0f0f0",opaque:type!=="JLabel",iconPath:"",iconData:""};
  }
  function normalizeComponentDesign(item){
    if(!item || typeof item!=="object") return item;
    const d=defaultAppearance(item.type);
    item.fontFamily=String(item.fontFamily||d.fontFamily);
    item.fontStyle=["plain","bold","italic","bolditalic"].includes(item.fontStyle)?item.fontStyle:d.fontStyle;
    item.fontSize=Math.max(8,Math.min(72,Number(item.fontSize)||d.fontSize));
    item.foreground=/^#[0-9a-f]{6}$/i.test(item.foreground||"")?item.foreground:d.foreground;
    item.background=/^#[0-9a-f]{6}$/i.test(item.background||"")?item.background:d.background;
    item.opaque=item.opaque===undefined?d.opaque:!!item.opaque;
    item.iconPath=String(item.iconPath||"");
    item.iconData=String(item.iconData||"");
    return item;
  }
  function normalizeProjectDesignData(){
    Object.values(state.forms||{}).forEach(f=>{
      f.backgroundColor=/^#[0-9a-f]{6}$/i.test(f.backgroundColor||"")?f.backgroundColor:"#f3f3f3";
      f.resizable=f.resizable===undefined?true:!!f.resizable;
      f.components=Array.isArray(f.components)?f.components:[];
      f.components.forEach(normalizeComponentDesign);
    });
  }
  function applyProject(data){
    data=unwrapProjectData(data);
    state.projectName=data.name||"JavaProject"; state.files=data.files||{}; state.forms=data.forms||{};
    state.uiState=data.uiState||{}; state.activeView=data.activeView||"design"; state.saveFileHandle=null;
    state.mainClass=safeClassName(data.mainClass||"MainForm");
    state.currentFile=data.currentFile && state.files[data.currentFile]!==undefined ? data.currentFile : Object.keys(state.files)[0]||"MainForm.java";
    state.selectedId=null; els.mainClassInput.value=state.mainClass; normalizeProjectDesignData();
    upgradeAuthMetadata(); autoLinkAuthForms(); updateActiveProjectLabel(); renderProjectTree(); loadCurrentFile({preferDesign:false,restoreView:true}); setDirty(false);
  }

  function blankForm(className="MainForm",title="Main Form"){
    return {className:safeClassName(className),title:title||className,width:760,height:500,backgroundColor:"#f3f3f3",resizable:true,components:[],counter:0};
  }
  function component(type,name,text,x,y,w,h,actionTarget="",role=""){
    return Object.assign({id:`component-${Date.now()}-${Math.random().toString(16).slice(2)}`,type,name,text,x,y,w,h,actionTarget,role,eventCode:null,lastGeneratedEventCode:null},defaultAppearance(type));
  }

  function loginTemplate(className,title){
    const f=blankForm(className,title||"Login");
    f.width=540; f.height=410; f.counter=7; f.templateType="login-db";
    const dashboardTarget=state.forms["DashboardForm.java"]?"DashboardForm":"";
    const registerTarget=state.forms["RegisterForm.java"]?"RegisterForm":state.forms["SignupForm.java"]?"SignupForm":"";
    f.components=[
      component("JLabel","lblLoginTitle","User Login",185,35,180,35,"","loginTitle"),
      component("JLabel","lblUsername","Username",70,110,100,28,"","loginUsernameLabel"),
      component("JTextField","txtUsername","",190,108,260,32,"","loginUsername"),
      component("JLabel","lblPassword","Password",70,165,100,28,"","loginPasswordLabel"),
      component("JPasswordField","txtPassword","",190,163,260,32,"","loginPassword"),
      component("JButton","btnLogin","Login",190,225,120,38,dashboardTarget,"loginSubmit"),
      component("JButton","btnOpenRegister","Create Account",320,225,130,38,registerTarget,"loginRegisterLink")
    ];
    return f;
  }

  function registerTemplate(className,title){
    const f=blankForm(className,title||"Register");
    f.width=590; f.height=560; f.counter=13; f.templateType="register-db";
    const loginTarget=state.forms["LoginForm.java"]?"LoginForm":"";
    f.components=[
      component("JLabel","lblRegisterTitle","Create Account",195,28,200,35,"","registerTitle"),
      component("JLabel","lblFullName","Full Name",65,95,120,28,"","registerFullNameLabel"),
      component("JTextField","txtFullName","",205,93,300,32,"","registerFullName"),
      component("JLabel","lblUsername","Username",65,145,120,28,"","registerUsernameLabel"),
      component("JTextField","txtUsername","",205,143,300,32,"","registerUsername"),
      component("JLabel","lblEmail","Email",65,195,120,28,"","registerEmailLabel"),
      component("JTextField","txtEmail","",205,193,300,32,"","registerEmail"),
      component("JLabel","lblPassword","Password",65,245,120,28,"","registerPasswordLabel"),
      component("JPasswordField","txtPassword","",205,243,300,32,"","registerPassword"),
      component("JLabel","lblConfirmPassword","Confirm Password",65,295,125,28,"","registerConfirmLabel"),
      component("JPasswordField","txtConfirmPassword","",205,293,300,32,"","registerConfirm"),
      component("JButton","btnRegister","Register",205,360,135,40,loginTarget,"registerSubmit"),
      component("JButton","btnBackLogin","Back to Login",355,360,150,40,loginTarget,"registerBack")
    ];
    return f;
  }

  function dashboardTemplate(className,title){
    const f=blankForm(className,title||"System Dashboard");
    f.width=900;
    f.height=600;
    f.counter=18;
    f.templateType="dashboard";

    const findTarget=(patterns)=>{
      const file=formFiles().find(name=>patterns.some(pattern=>pattern.test(classFromFile(name))));
      return file?classFromFile(file):"";
    };

    const studentTarget=findTarget([/^StudentForm$/i,/Student/i]);
    const recordsTarget=findTarget([/^RecordsForm$/i,/Record/i]);
    const reportsTarget=findTarget([/^ReportForm$/i,/^ReportsForm$/i,/Report/i]);
    const usersTarget=findTarget([/^UserForm$/i,/^UsersForm$/i,/User/i]);
    const settingsTarget=findTarget([/^SettingsForm$/i,/Setting/i]);
    const loginTarget=findTarget([/^LoginForm$/i,/Login/i]);

    f.components=[
      component("JLabel","lblDashboardTitle","SYSTEM DASHBOARD",35,25,300,40,"","dashboardTitle"),
      component("JLabel","lblWelcome","Welcome! Select a module to continue.",35,68,410,28,"","dashboardWelcome"),

      component("JLabel","lblStudentsCard","Students",35,125,150,28,"","dashboardStudentsCard"),
      component("JLabel","lblStudentsValue","0",35,155,150,38,"","dashboardStudentsValue"),
      component("JLabel","lblRecordsCard","Records",220,125,150,28,"","dashboardRecordsCard"),
      component("JLabel","lblRecordsValue","0",220,155,150,38,"","dashboardRecordsValue"),
      component("JLabel","lblReportsCard","Reports",405,125,150,28,"","dashboardReportsCard"),
      component("JLabel","lblReportsValue","0",405,155,150,38,"","dashboardReportsValue"),
      component("JLabel","lblUsersCard","Users",590,125,150,28,"","dashboardUsersCard"),
      component("JLabel","lblUsersValue","0",590,155,150,38,"","dashboardUsersValue"),

      component("JButton","btnStudents","Student Management",35,235,190,48,studentTarget,"dashboardStudents"),
      component("JButton","btnRecords","Records",245,235,190,48,recordsTarget,"dashboardRecords"),
      component("JButton","btnReports","Reports",455,235,190,48,reportsTarget,"dashboardReports"),
      component("JButton","btnUsers","User Accounts",665,235,190,48,usersTarget,"dashboardUsers"),

      component("JButton","btnSettings","Settings",35,310,190,48,settingsTarget,"dashboardSettings"),
      component("JLabel","lblInstruction","You can connect each dashboard button to another JFrame using Component Properties.",245,316,500,35,"","dashboardInstruction"),

      component("JLabel","lblFooter","Java JFrame Practice Mini System",35,485,350,28,"","dashboardFooter"),
      component("JButton","btnLogout","Logout",715,475,140,40,loginTarget,"dashboardLogout")
    ];
    return f;
  }
  function dataEntryTemplate(className,title){
    const f=blankForm(className,title||"Data Entry Form"); f.width=680; f.height=480; f.counter=8;
    f.components=[
      component("JLabel","jLabel1",title||"Data Entry Form",30,25,260,35),
      component("JLabel","jLabel2","Name",45,95,100,28),
      component("JTextField","jTextField3","",160,95,300,30),
      component("JLabel","jLabel4","Course",45,145,100,28),
      component("JComboBox","jComboBox5","BSIT, BSCS, ACT",160,145,200,32),
      component("JButton","jButton6","Save",160,215,100,36),
      component("JButton","jButton7","Update",275,215,100,36),
      component("JButton","jButton8","Delete",390,215,100,36)
    ]; return f;
  }



  function inventoryRecordTemplate(className="InventoryForm",title="Inventory Management"){
    const f=blankForm(className,title||"Inventory Management");
    f.width=980; f.height=650; f.counter=18; f.templateType="inventory-record";
    f.components=[
      component("JLabel","lblInventoryTitle","INVENTORY MANAGEMENT",30,20,360,40,"","inventoryTitle"),
      component("JLabel","lblProductId","Product ID",35,85,105,28),
      component("JTextField","txtProductId","",150,83,210,32),
      component("JLabel","lblProductName","Product Name",390,85,110,28),
      component("JTextField","txtProductName","",510,83,300,32),
      component("JLabel","lblCategory","Category",35,135,105,28),
      component("JComboBox","cmbCategory","General, Electronics, Office Supplies, School Supplies, Other",150,133,210,32),
      component("JLabel","lblQuantity","Quantity",390,135,110,28),
      component("JTextField","txtQuantity","0",510,133,130,32),
      component("JLabel","lblUnitPrice","Unit Price",665,135,100,28),
      component("JTextField","txtUnitPrice","0.00",765,133,150,32),
      component("JLabel","lblReorderLevel","Reorder Level",35,185,105,28),
      component("JTextField","txtReorderLevel","5",150,183,120,32),
      component("JButton","btnSaveProduct","Save",315,183,100,36),
      component("JButton","btnUpdateProduct","Update",425,183,100,36),
      component("JButton","btnDeleteProduct","Delete",535,183,100,36),
      component("JButton","btnClearProduct","Clear",645,183,100,36),
      component("JTable","tblInventory","Product ID, Product Name, Category, Quantity, Unit Price, Reorder Level",35,255,880,285),
      component("JLabel","lblInventoryHint","Select a row to edit, then use Update or Delete.",35,555,420,28)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=22; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    ["btnSaveProduct","btnUpdateProduct","btnDeleteProduct","btnClearProduct"].forEach(n=>{const b=f.components.find(i=>i.name===n);if(b){b.fontStyle="bold";}});
    return f;
  }

  function supplierRecordTemplate(className="SupplierForm",title="Supplier Management"){
    const f=blankForm(className,title||"Supplier Management");
    f.width=860; f.height=570; f.counter=14; f.templateType="supplier-record";
    f.components=[
      component("JLabel","lblSupplierTitle","SUPPLIER MANAGEMENT",30,20,340,40),
      component("JLabel","lblSupplierId","Supplier ID",35,85,105,28),
      component("JTextField","txtSupplierId","",150,83,210,32),
      component("JLabel","lblSupplierName","Supplier Name",390,85,110,28),
      component("JTextField","txtSupplierName","",510,83,280,32),
      component("JLabel","lblContact","Contact No.",35,135,105,28),
      component("JTextField","txtContact","",150,133,210,32),
      component("JLabel","lblAddress","Address",390,135,110,28),
      component("JTextField","txtAddress","",510,133,280,32),
      component("JButton","btnSaveSupplier","Save",150,190,100,36),
      component("JButton","btnUpdateSupplier","Update",260,190,100,36),
      component("JButton","btnDeleteSupplier","Delete",370,190,100,36),
      component("JButton","btnClearSupplier","Clear",480,190,100,36),
      component("JTable","tblSuppliers","Supplier ID, Supplier Name, Contact No., Address",35,255,755,220)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=22; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    return f;
  }

  function studentRecordTemplate(className="StudentRecordForm",title="Student Record Management"){
    const f=blankForm(className,title||"Student Record Management");
    f.width=1000; f.height=690; f.counter=20; f.templateType="student-record";
    f.components=[
      component("JLabel","lblStudentTitle","STUDENT RECORD MANAGEMENT",30,20,420,40,"","studentTitle"),
      component("JLabel","lblStudentId","Student ID",35,85,105,28),
      component("JTextField","txtStudentId","",150,83,210,32),
      component("JLabel","lblFullName","Full Name",390,85,110,28),
      component("JTextField","txtFullName","",510,83,410,32),
      component("JLabel","lblCourse","Course",35,135,105,28),
      component("JComboBox","cmbCourse","BSIT, BSCS, ACT, BSEMC, Other",150,133,210,32),
      component("JLabel","lblYearLevel","Year Level",390,135,110,28),
      component("JComboBox","cmbYearLevel","1st Year, 2nd Year, 3rd Year, 4th Year",510,133,180,32),
      component("JLabel","lblContact","Contact No.",35,185,105,28),
      component("JTextField","txtContact","",150,183,210,32),
      component("JLabel","lblEmail","Email",390,185,110,28),
      component("JTextField","txtEmail","",510,183,300,32),
      component("JButton","btnSaveStudent","Save",150,240,100,36),
      component("JButton","btnUpdateStudent","Update",260,240,100,36),
      component("JButton","btnDeleteStudent","Delete",370,240,100,36),
      component("JButton","btnClearStudent","Clear",480,240,100,36),
      component("JTable","tblStudents","Student ID, Full Name, Course, Year Level, Contact No., Email",35,315,885,275),
      component("JLabel","lblStudentHint","Use this starter form to practice CRUD operations with JDBC and MySQL.",35,605,520,28)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=22; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    return f;
  }

  function courseRecordTemplate(className="CourseForm",title="Course Management"){
    const f=blankForm(className,title||"Course Management");
    f.width=780; f.height=520; f.counter=11; f.templateType="course-record";
    f.components=[
      component("JLabel","lblCourseTitle","COURSE MANAGEMENT",30,20,330,40),
      component("JLabel","lblCourseCode","Course Code",35,90,110,28),
      component("JTextField","txtCourseCode","",155,88,200,32),
      component("JLabel","lblCourseName","Course Name",385,90,110,28),
      component("JTextField","txtCourseName","",505,88,220,32),
      component("JButton","btnSaveCourse","Save",155,145,100,36),
      component("JButton","btnUpdateCourse","Update",265,145,100,36),
      component("JButton","btnDeleteCourse","Delete",375,145,100,36),
      component("JButton","btnClearCourse","Clear",485,145,100,36),
      component("JTable","tblCourses","Course Code, Course Name",35,220,690,205),
      component("JLabel","lblCourseHint","Maintain course choices used by the Student Record form.",35,440,470,28)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=22; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    return f;
  }

  function inventoryDashboardTemplate(className="InventoryDashboardForm",title="Inventory Dashboard"){
    const f=blankForm(className,title||"Inventory Dashboard");
    f.width=900; f.height=580; f.counter=15; f.templateType="inventory-dashboard";
    f.components=[
      component("JLabel","lblTitle","INVENTORY MANAGEMENT SYSTEM",35,25,430,42),
      component("JLabel","lblWelcome","Choose a module to continue.",35,70,300,28),
      component("JLabel","lblProductsCard","Products",35,125,160,28),
      component("JLabel","lblProductsValue","0",35,155,160,38),
      component("JLabel","lblLowStockCard","Low Stock",220,125,160,28),
      component("JLabel","lblLowStockValue","0",220,155,160,38),
      component("JLabel","lblSuppliersCard","Suppliers",405,125,160,28),
      component("JLabel","lblSuppliersValue","0",405,155,160,38),
      component("JLabel","lblValueCard","Inventory Value",590,125,190,28),
      component("JLabel","lblValueAmount","0.00",590,155,190,38),
      component("JButton","btnInventory","Manage Inventory",35,245,200,48,"InventoryForm","inventoryOpen"),
      component("JButton","btnSuppliers","Manage Suppliers",255,245,200,48,"SupplierForm","supplierOpen"),
      component("JButton","btnReports","Inventory Reports",475,245,200,48,"","inventoryReports"),
      component("JButton","btnLogout","Logout",715,450,140,40,"LoginForm","dashboardLogout"),
      component("JLabel","lblFooter","Java JFrame Inventory Mini System",35,460,360,28)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=23; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    return f;
  }

  function studentDashboardTemplate(className="StudentDashboardForm",title="Student Record Dashboard"){
    const f=blankForm(className,title||"Student Record Dashboard");
    f.width=900; f.height=580; f.counter=15; f.templateType="student-dashboard";
    f.components=[
      component("JLabel","lblTitle","STUDENT RECORD SYSTEM",35,25,390,42),
      component("JLabel","lblWelcome","Choose a module to continue.",35,70,300,28),
      component("JLabel","lblStudentsCard","Students",35,125,160,28),
      component("JLabel","lblStudentsValue","0",35,155,160,38),
      component("JLabel","lblCoursesCard","Courses",220,125,160,28),
      component("JLabel","lblCoursesValue","0",220,155,160,38),
      component("JLabel","lblYearCard","Year Levels",405,125,160,28),
      component("JLabel","lblYearValue","4",405,155,160,38),
      component("JLabel","lblRecordsCard","Records",590,125,160,28),
      component("JLabel","lblRecordsValue","0",590,155,160,38),
      component("JButton","btnStudents","Student Records",35,245,200,48,"StudentRecordForm","studentOpen"),
      component("JButton","btnCourses","Manage Courses",255,245,200,48,"CourseForm","courseOpen"),
      component("JButton","btnReports","Student Reports",475,245,200,48,"","studentReports"),
      component("JButton","btnLogout","Logout",715,450,140,40,"LoginForm","dashboardLogout"),
      component("JLabel","lblFooter","Java JFrame Student Record Mini System",35,460,390,28)
    ];
    const titleItem=f.components[0]; titleItem.fontSize=23; titleItem.fontStyle="bold"; titleItem.foreground="#174a72"; titleItem.opaque=false;
    return f;
  }

  function buildInventoryMiniSystemSql(){
    return `${buildAuthSql()}\n\n-- Inventory Management Mini System\nCREATE TABLE IF NOT EXISTS products (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    product_code VARCHAR(50) NOT NULL UNIQUE,\n    product_name VARCHAR(150) NOT NULL,\n    category VARCHAR(100),\n    quantity INT NOT NULL DEFAULT 0,\n    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,\n    reorder_level INT NOT NULL DEFAULT 5,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE TABLE IF NOT EXISTS suppliers (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    supplier_code VARCHAR(50) NOT NULL UNIQUE,\n    supplier_name VARCHAR(150) NOT NULL,\n    contact_no VARCHAR(50),\n    address VARCHAR(255),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n`;
  }

  function buildStudentMiniSystemSql(){
    return `${buildAuthSql()}\n\n-- Student Record Mini System\nCREATE TABLE IF NOT EXISTS courses (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    course_code VARCHAR(30) NOT NULL UNIQUE,\n    course_name VARCHAR(150) NOT NULL\n);\n\nCREATE TABLE IF NOT EXISTS students (\n    id INT AUTO_INCREMENT PRIMARY KEY,\n    student_no VARCHAR(50) NOT NULL UNIQUE,\n    full_name VARCHAR(150) NOT NULL,\n    course VARCHAR(100),\n    year_level VARCHAR(30),\n    contact_no VARCHAR(50),\n    email VARCHAR(150),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n`;
  }

  function createMiniSystemProject(name,template="blank"){
    const projectName=String(name||"").trim()||(
      template==="inventory"?"InventoryManagementSystem":template==="student-record"?"StudentRecordSystem":"JavaJFrameProject"
    );
    state.projectName=projectName; state.files={}; state.forms={}; state.uiState={}; state.activeView="design"; state.saveFileHandle=null; state.selectedId=null;

    if(template==="inventory"){
      const login=loginTemplate("LoginForm","Inventory Login");
      const loginBtn=login.components.find(i=>i.role==="loginSubmit"); if(loginBtn)loginBtn.actionTarget="InventoryDashboardForm";
      const registerBtn=login.components.find(i=>i.role==="loginRegisterLink"); if(registerBtn){registerBtn.text=""; registerBtn.w=1; registerBtn.h=1; registerBtn.x=0; registerBtn.y=0;}
      state.forms={
        "LoginForm.java":login,
        "InventoryDashboardForm.java":inventoryDashboardTemplate(),
        "InventoryForm.java":inventoryRecordTemplate(),
        "SupplierForm.java":supplierRecordTemplate()
      };
      state.mainClass="LoginForm"; state.currentFile="LoginForm.java";
      state.files["DBConnection.java"]=buildDbConnectionCode();
      state.files["PasswordUtil.java"]=buildPasswordUtilCode();
      state.files["database_setup.sql"]=buildInventoryMiniSystemSql();
      if(els.dbName)els.dbName.value="inventory_system";
    }else if(template==="student-record"){
      const login=loginTemplate("LoginForm","Student Record Login");
      const loginBtn=login.components.find(i=>i.role==="loginSubmit"); if(loginBtn)loginBtn.actionTarget="StudentDashboardForm";
      const registerBtn=login.components.find(i=>i.role==="loginRegisterLink"); if(registerBtn){registerBtn.text=""; registerBtn.w=1; registerBtn.h=1; registerBtn.x=0; registerBtn.y=0;}
      state.forms={
        "LoginForm.java":login,
        "StudentDashboardForm.java":studentDashboardTemplate(),
        "StudentRecordForm.java":studentRecordTemplate(),
        "CourseForm.java":courseRecordTemplate()
      };
      state.mainClass="LoginForm"; state.currentFile="LoginForm.java";
      state.files["DBConnection.java"]=buildDbConnectionCode();
      state.files["PasswordUtil.java"]=buildPasswordUtilCode();
      state.files["database_setup.sql"]=buildStudentMiniSystemSql();
      if(els.dbName)els.dbName.value="student_record_system";
    }else{
      state.mainClass="MainForm"; state.currentFile="MainForm.java";
      state.forms={"MainForm.java":blankForm("MainForm","Main Form")};
    }

    Object.keys(state.forms).forEach(file=>{state.files[file]=generateJavaCode(state.forms[file]);});
    autoLinkAuthForms();
    // Regenerate once after linking so navigation ActionPerformed code matches the final targets.
    Object.keys(state.forms).forEach(file=>{state.files[file]=generateJavaCode(state.forms[file]);});
    els.mainClassInput.value=state.mainClass; updateActiveProjectLabel(); renderProjectTree(); loadCurrentFile({preferDesign:true,restoreView:false}); setDirty(true);
    const label=template==="inventory"?"Inventory Management Mini System":template==="student-record"?"Student Record Mini System":"Blank Java JFrame Project";
    replaceOutput(`Project "${state.projectName}" created from ${label}.\nYour work is auto-saved in this browser. Use Save As File to create a project file you can reopen later.`);
  }

  function autoLinkAuthForms(){
    const loginFile=formFiles().find(n=>/login/i.test(classFromFile(n)));
    const registerFile=formFiles().find(n=>/register|signup/i.test(classFromFile(n)));
    const dashboardFile=formFiles().find(n=>/dashboard/i.test(classFromFile(n)));

    const loginClass=loginFile?classFromFile(loginFile):"";
    const registerClass=registerFile?classFromFile(registerFile):"";
    const dashboardClass=dashboardFile?classFromFile(dashboardFile):"";

    if(loginFile){
      const f=state.forms[loginFile];
      const loginButton=(f.components||[]).find(i=>i.role==="loginSubmit");
      const registerButton=(f.components||[]).find(i=>i.role==="loginRegisterLink");
      if(loginButton && !loginButton.actionTarget && dashboardClass)loginButton.actionTarget=dashboardClass;
      if(registerButton && !registerButton.actionTarget && registerClass)registerButton.actionTarget=registerClass;
    }

    if(registerFile){
      const f=state.forms[registerFile];
      const submit=(f.components||[]).find(i=>i.role==="registerSubmit");
      const back=(f.components||[]).find(i=>i.role==="registerBack");
      if(submit && !submit.actionTarget && loginClass)submit.actionTarget=loginClass;
      if(back && !back.actionTarget && loginClass)back.actionTarget=loginClass;
    }

    if(dashboardFile){
      const f=state.forms[dashboardFile];
      const targets={
        dashboardStudents: formFiles().find(n=>/^StudentForm$/i.test(classFromFile(n)) || /Student/i.test(classFromFile(n))),
        dashboardRecords: formFiles().find(n=>/^RecordsForm$/i.test(classFromFile(n)) || /Record/i.test(classFromFile(n))),
        dashboardReports: formFiles().find(n=>/^Reports?Form$/i.test(classFromFile(n)) || /Report/i.test(classFromFile(n))),
        dashboardUsers: formFiles().find(n=>/^Users?Form$/i.test(classFromFile(n)) || /User/i.test(classFromFile(n))),
        dashboardSettings: formFiles().find(n=>/^SettingsForm$/i.test(classFromFile(n)) || /Setting/i.test(classFromFile(n))),
        dashboardLogout: loginFile
      };

      Object.entries(targets).forEach(([role,file])=>{
        const button=(f.components||[]).find(i=>i.role===role);
        if(button && !button.actionTarget && file && file!==dashboardFile){
          button.actionTarget=classFromFile(file);
        }
      });
    }
  }

  function upgradeAuthMetadata(){
    Object.entries(state.forms||{}).forEach(([file,f])=>{
      if(!f || !Array.isArray(f.components)) return;
      const lower=String(f.className||classFromFile(file)).toLowerCase();

      if(!f.templateType && lower.includes("login")){
        const user=f.components.find(i=>i.type==="JTextField");
        const pass=f.components.find(i=>i.type==="JPasswordField");
        const submit=f.components.find(i=>i.type==="JButton" && /login|sign\s*in/i.test(i.text||""));
        if(user && pass && submit){
          f.templateType="login-db";
          user.role=user.role||"loginUsername";
          pass.role=pass.role||"loginPassword";
          submit.role=submit.role||"loginSubmit";
        }
      }

      if(!f.templateType && (lower.includes("register") || lower.includes("signup") || lower.includes("sign_up"))){
        const texts=f.components.filter(i=>i.type==="JTextField");
        const passes=f.components.filter(i=>i.type==="JPasswordField");
        const submit=f.components.find(i=>i.type==="JButton" && /register|sign\s*up|create/i.test(i.text||""));
        if(texts.length>=3 && passes.length>=2 && submit){
          f.templateType="register-db";
          texts[0].role=texts[0].role||"registerFullName";
          texts[1].role=texts[1].role||"registerUsername";
          texts[2].role=texts[2].role||"registerEmail";
          passes[0].role=passes[0].role||"registerPassword";
          passes[1].role=passes[1].role||"registerConfirm";
          submit.role=submit.role||"registerSubmit";
        }
      }
    });
  }


  function newProject(name="JavaJFrameProject",template="blank"){
    createMiniSystemProject(name,template);
  }
  function saveProject(){
    if(!state.projectName){showNewProjectDialog();return;}
    const data=serializeProject();
    try{
      const projects=getProjects(); projects[state.projectName]=data; putProjects(projects); setDirty(false); renderProjectTree();
      log(`Project "${state.projectName}" saved with ${javaFiles().length} Java file(s). Editor position was saved too.`,"success");
    }catch(e){
      log(`Browser save failed: ${e.message||e}. Use Save As File so your project is not lost.`,"error");
    }
  }
  async function saveProjectAsFile(){
    if(!state.projectName){showNewProjectDialog();return;}
    const data=serializeProject();
    const payload=JSON.stringify({format:"JavaJFramePracticeIDE",version:4,project:data},null,2);
    const suggested=`${String(state.projectName||"JavaProject").replace(/[^A-Za-z0-9._-]+/g,"_")}.jframeide.json`;
    try{
      if("showSaveFilePicker" in window){
        const handle=await window.showSaveFilePicker({suggestedName:suggested,types:[{description:"Java JFrame Practice IDE Project",accept:{"application/json":[".json"]}}]});
        const writable=await handle.createWritable(); await writable.write(payload); await writable.close(); state.saveFileHandle=handle;
        const projects=getProjects();projects[state.projectName]=data;putProjects(projects);setDirty(false);
        log(`Project file saved as ${handle.name||suggested}.`,"success");
        return;
      }
      const blob=new Blob([payload],{type:"application/json"});
      const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=suggested; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      const projects=getProjects();projects[state.projectName]=data;putProjects(projects);setDirty(false);
      log(`Project file downloaded as ${suggested}. Use Open Project to reopen it later.`,"success");
    }catch(e){
      if(e?.name!=="AbortError") log(`Save As failed: ${e.message||e}`,"error");
    }
  }
  function updateActiveProjectLabel(){ els.activeProjectLabel.textContent=state.projectName||"No project"; }

  function renderProjectTree(){
    if(!state.projectName){els.projectTree.innerHTML='<div class="empty">Create or open a project.</div>';return;}
    const names=Object.keys(state.files).sort((a,b)=>{if(classFromFile(a)===state.mainClass)return-1;if(classFromFile(b)===state.mainClass)return 1;return a.localeCompare(b);});
    els.projectTree.innerHTML=`<button type="button" class="node project-root">📁 ${escapeHtml(state.projectName)}</button>`+
      names.map(name=>{
        const form=!!state.forms[name], main=classFromFile(name)===state.mainClass;
        return `<div class="tree-file-row ${name===state.currentFile?"active-row":""}">
          <button type="button" class="node file ${name===state.currentFile?"active":""} ${main?"main-file":""}" data-file="${escapeHtml(name)}" title="Open ${escapeHtml(name)}">${form?"🖼️":"📄"} ${escapeHtml(name)}</button>
          <button type="button" class="tree-delete" data-delete-file="${escapeHtml(name)}" title="Delete ${escapeHtml(name)}" aria-label="Delete ${escapeHtml(name)}">×</button>
        </div>`;
      }).join("");
    $$(".file",els.projectTree).forEach(b=>b.addEventListener("click",()=>openVirtualFile(b.dataset.file)));
    $$("[data-delete-file]",els.projectTree).forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();confirmDeleteFile(b.dataset.deleteFile);}));
  }

  function loadCurrentFile({preferDesign=false,restoreView=true}={}){
    state.selectedId=null; els.currentFileLabel.textContent=state.currentFile; els.activeFileBadge.textContent=state.currentFile;
    els.codeEditor.value=state.files[state.currentFile]??"";
    if(state.foldView) renderFoldedCode();
    if(isFormFile()){
      const f=currentForm(); normalizeProjectDesignData();
      els.className.value=f.className; els.frameTitle.value=f.title; els.frameWidth.value=f.width; els.frameHeight.value=f.height;
      if(els.frameBackground)els.frameBackground.value=f.backgroundColor||"#f3f3f3"; if(els.frameResizable)els.frameResizable.checked=f.resizable!==false;
      updateFrameVisual(); renderComponents(); setFormPanelsEnabled(true); els.nonFormNotice.classList.add("hidden"); els.designerWrap.classList.remove("hidden");
    } else {
      renderComponents(); setFormPanelsEnabled(false); els.nonFormNotice.classList.remove("hidden"); els.designerWrap.classList.add("hidden");
    }
    populateActionTargets(); renderProjectTree();
    if(restoreView) restoreCurrentFileUI(preferDesign); else switchView(isFormFile()&&preferDesign?"design":"source",false);
  }
  function openVirtualFile(fileName){
    if(!fileName || state.files[fileName]===undefined)return;
    captureCurrentFileUI();
    if(isFormFile()) syncGeneratedSourceFromDesign(); else syncEditor();
    state.currentFile=fileName; loadCurrentFile({preferDesign:isFormFile(fileName),restoreView:true}); log(`Opened ${fileName}.`);
  }
  function setFormPanelsEnabled(enabled){
    els.framePropertiesPanel.classList.toggle("disabled-panel",!enabled); els.componentPanel.classList.toggle("disabled-panel",!enabled);
    els.generateBtn.disabled=!enabled; els.previewBtn.disabled=!enabled;
  }

  function showModal(title,html){els.modalTitle.textContent=title;els.modalBody.innerHTML=html;els.modal.classList.remove("hidden");}
  function closeModal(){els.modal.classList.add("hidden");els.modalBody.innerHTML="";}
  function showNewProjectDialog(){
    showModal("Create Java Project",`<div class="content">
      <p class="notice"><strong>Mini System Templates:</strong> start blank, or generate a ready-to-practice Inventory or Student Record project with Login, Dashboard, CRUD forms, JDBC helper files, and MySQL tables.</p>
      <label>Project Name<input id="newProjectName" value="JavaJFrameProject" autocomplete="off"></label>
      <label>Mini System Template
        <select id="newProjectTemplate">
          <option value="blank">Blank Java JFrame Project</option>
          <option value="inventory">Inventory Management Mini System</option>
          <option value="student-record">Student Record Mini System</option>
        </select>
      </label>
      <div class="template-grid" id="miniTemplatePreview">
        <div class="template-card"><strong>Blank Project</strong><span>Start with one empty MainForm and build everything yourself.</span></div>
        <div class="template-card"><strong>Inventory System</strong><span>Login, dashboard, product inventory, suppliers, JDBC helpers, and MySQL tables.</span></div>
        <div class="template-card"><strong>Student Record</strong><span>Login, dashboard, student records, courses, JDBC helpers, and MySQL tables.</span></div>
      </div>
      <div class="actions"><button id="cancelNewProject" type="button">Cancel</button><button id="createProjectConfirm" type="button">Create Project</button></div>
    </div>`);
    const input=$("#newProjectName",els.modalBody), template=$("#newProjectTemplate",els.modalBody);
    const defaults={blank:"JavaJFrameProject",inventory:"InventoryManagementSystem","student-record":"StudentRecordSystem"};
    template.onchange=()=>{const previous=Object.values(defaults).includes(input.value.trim());if(previous||!input.value.trim())input.value=defaults[template.value];};
    const create=()=>{newProject(input.value,template.value);closeModal();};
    input.focus(); input.select();
    $("#cancelNewProject",els.modalBody).onclick=closeModal; $("#createProjectConfirm",els.modalBody).onclick=create;
    input.onkeydown=e=>{if(e.key==="Enter")create();};
  }
  function showNewFileDialog(){
    if(!state.projectName){showNewProjectDialog();return;}
    showModal("New File / JFrame Form",`<div class="content">
      <p class="notice">Create as many JFrame forms and Java classes as your mini system needs. Each JFrame has its own Design canvas.</p>
      <div class="file-kind">
        <label><input type="radio" name="fileKind" value="form" checked> <strong>JFrame Form</strong><br><small>Design + Java source</small></label>
        <label><input type="radio" name="fileKind" value="class"> <strong>Java Class</strong><br><small>Source code only</small></label>
      </div>
      <label>Class Name<input id="newFileClass" value="LoginForm" autocomplete="off"></label>
      <label id="newWindowTitleLabel">Window Title<input id="newWindowTitle" value="Login" autocomplete="off"></label>
      <label id="templateLabel">JFrame Template<select id="newFormTemplate"><option value="blank">Blank JFrame</option><option value="login-db">Login Form - MySQL Database</option><option value="register-db">Register / Signup - MySQL Database</option><option value="dashboard">Dashboard - Professional JFrame</option><option value="inventory">Inventory Management / CRUD Form</option><option value="student-record">Student Record / CRUD Form</option><option value="data">Generic Data Entry / CRUD Form</option></select></label>
      <div class="actions"><button id="cancelNewFile" type="button">Cancel</button><button id="createNewFile" type="button">Create File</button></div>
    </div>`);
    const classInput=$("#newFileClass",els.modalBody), titleInput=$("#newWindowTitle",els.modalBody), titleLabel=$("#newWindowTitleLabel",els.modalBody), templateLabel=$("#templateLabel",els.modalBody), templateSelect=$("#newFormTemplate",els.modalBody);
    const updateKind=()=>{const kind=$("input[name='fileKind']:checked",els.modalBody).value; const form=kind==="form"; titleLabel.classList.toggle("hidden",!form); templateLabel.classList.toggle("hidden",!form);};
    const applyTemplateDefaults=()=>{
      const presets={
        "login-db":["LoginForm","Login"],
        "register-db":["RegisterForm","Create Account"],
        "dashboard":["DashboardForm","System Dashboard"],
        "inventory":["InventoryForm","Inventory Management"],
        "student-record":["StudentRecordForm","Student Record Management"],
        "data":["DataEntryForm","Data Entry Form"]
      };
      const preset=presets[templateSelect.value];
      if(preset){classInput.value=preset[0];titleInput.value=preset[1];}
    };
    $$("input[name='fileKind']",els.modalBody).forEach(r=>r.onchange=updateKind);
    templateSelect.onchange=applyTemplateDefaults;
    $("#cancelNewFile",els.modalBody).onclick=closeModal;
    $("#createNewFile",els.modalBody).onclick=()=>{
      const kind=$("input[name='fileKind']:checked",els.modalBody).value; const className=safeClassName(classInput.value); const fileName=`${className}.java`;
      if(state.files[fileName]!==undefined){log(`${fileName} already exists.`,"error");return;}
      if(kind==="class"){
        state.files[fileName]=`public class ${className} {\n\n    public ${className}() {\n    }\n}\n`; state.currentFile=fileName; state.selectedId=null; closeModal(); loadCurrentFile({preferDesign:false}); switchView("source"); setDirty(true); log(`${fileName} Java class created.`,"success"); return;
      }
      const title=titleInput.value.trim()||className; const template=$("#newFormTemplate",els.modalBody).value;
      let f=template==="login-db"?loginTemplate(className,title):template==="register-db"?registerTemplate(className,title):template==="dashboard"?dashboardTemplate(className,title):template==="inventory"?inventoryRecordTemplate(className,title):template==="student-record"?studentRecordTemplate(className,title):template==="data"?dataEntryTemplate(className,title):blankForm(className,title);
      if(template==="login-db" || template==="register-db") ensureAuthSupportFiles(false);
      state.forms[fileName]=f; upgradeAuthMetadata(); autoLinkAuthForms(); state.files[fileName]=generateJavaCode(f); state.currentFile=fileName; state.selectedId=null; closeModal(); loadCurrentFile({preferDesign:true}); setDirty(true); log(`${fileName} JFrame Form created.`,"success");
    };
    classInput.focus(); classInput.select();
  }

  function showOpenProjectDialog(){
    const projects=getProjects(),names=Object.keys(projects).sort();
    const list=names.length?`<div class="project-list">${names.map(n=>`<button type="button" data-project="${escapeHtml(n)}"><strong>${escapeHtml(n)}</strong><br><small>${Object.keys(projects[n].files||{}).length} Java file(s) • Saved ${new Date(projects[n].savedAt||Date.now()).toLocaleString()}</small></button>`).join("")}</div>`:'<p class="notice">No projects are saved in this browser yet.</p>';
    showModal("Open Project",`<div class="content">${list}<hr><p class="notice"><strong>Open a saved project file:</strong> choose the .jframeide.json file created by Save As File. Your last file, Source/Design tab, cursor and scroll position are restored.</p><input id="projectFilePicker" type="file" accept=".json,.jframeide,.java,application/json,text/x-java-source"></div>`);
    $$('[data-project]',els.modalBody).forEach(b=>b.onclick=()=>{captureCurrentFileUI();applyProject(projects[b.dataset.project]);closeModal();log(`Project "${b.dataset.project}" opened at its saved editing position.`,"success");});
    $("#projectFilePicker",els.modalBody).onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const text=await file.text();
      if(/\.(json|jframeide)$/i.test(file.name)){try{applyProject(JSON.parse(text));closeModal();const projectsNow=getProjects();projectsNow[state.projectName]=projectSnapshot();putProjects(projectsNow);log(`Imported project "${state.projectName}" and restored its editing position.`,"success");}catch(err){log(`Invalid project file: ${err.message||"JSON could not be read."}`,"error");}return;}
      state.projectName=file.name.replace(/\.java$/i,"")||"ImportedJavaProject";state.currentFile=file.name;state.mainClass=classFromFile(file.name);state.files={[file.name]:text};state.forms={};state.uiState={[file.name]:{view:"source",selectionStart:0,selectionEnd:0,codeScrollTop:0}};state.selectedId=null;state.saveFileHandle=null;els.mainClassInput.value=state.mainClass;updateActiveProjectLabel();renderProjectTree();loadCurrentFile({preferDesign:false,restoreView:true});setDirty(true);closeModal();log(`Opened ${file.name}.`);
    };
  }

  function switchView(view,capture=true){
    if(capture) captureCurrentFileUI();
    const design=view==="design"; state.activeView=view;
    els.designView.classList.toggle("active",design);els.sourceView.classList.toggle("active",!design);
    $$(".tab").forEach(t=>{const a=t.dataset.view===view;t.classList.toggle("active",a);t.setAttribute("aria-selected",String(a));});
    if(state.projectName && state.currentFile){
      state.uiState[state.currentFile]=Object.assign({},state.uiState[state.currentFile]||{},{view});
    }
  }
  function syncFormFromInputs(){
    const f=currentForm(); if(!f)return;
    const oldClass=f.className; f.className=safeClassName(els.className.value); f.title=els.frameTitle.value||f.className; f.width=Math.max(400,Math.min(1200,Number(els.frameWidth.value)||760)); f.height=Math.max(300,Math.min(800,Number(els.frameHeight.value)||500));
    f.backgroundColor=els.frameBackground?.value||f.backgroundColor||"#f3f3f3"; f.resizable=els.frameResizable?!!els.frameResizable.checked:true;
    els.className.value=f.className; els.frameWidth.value=f.width; els.frameHeight.value=f.height;
    if(f.className!==oldClass){ renameCurrentFormFile(f.className); }
  }
  function renameCurrentFormFile(newClass){
    const oldFile=state.currentFile,newFile=`${safeClassName(newClass)}.java`; if(oldFile===newFile)return;
    if(state.files[newFile]!==undefined){const f=currentForm();f.className=classFromFile(oldFile);els.className.value=f.className;log(`${newFile} already exists. Class name was not changed.`,"error");return;}
    const wasMain=classFromFile(oldFile)===state.mainClass; state.forms[newFile]=state.forms[oldFile];delete state.forms[oldFile];state.files[newFile]=state.files[oldFile]||"";delete state.files[oldFile];
    if(state.uiState[oldFile]){state.uiState[newFile]=state.uiState[oldFile];delete state.uiState[oldFile];}
    state.currentFile=newFile;if(wasMain){state.mainClass=safeClassName(newClass);els.mainClassInput.value=state.mainClass;}renderProjectTree();
  }
  function updateFrameVisual(){
    const f=currentForm();if(!f)return;
    els.frameTitleDisplay.textContent=f.title||f.className;els.fakeWindow.style.width=`${f.width}px`;els.canvas.style.width=`${f.width}px`;els.canvas.style.height=`${f.height}px`;
    els.canvas.style.backgroundColor=f.backgroundColor||"#f3f3f3";
  }
  function updateFrame(){if(!isFormFile())return;syncFormFromInputs();updateFrameVisual();renderProjectTree();syncGeneratedSourceFromDesign();setDirty(true);}

  function createComponent(type,x=30,y=30){
    const f=currentForm();if(!f){log("Open a JFrame Form before adding Swing controls.","error");return;}const d=componentDefaults[type];if(!d)return;const n=++f.counter;
    const item=Object.assign({id:`component-${Date.now()}-${n}`,type,name:`${d.prefix}${n}`,text:d.text,x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y)),w:d.w,h:d.h,actionTarget:"",eventCode:null,lastGeneratedEventCode:null},defaultAppearance(type));
    f.components.push(item);state.selectedId=item.id;renderComponents();selectComponent(item.id);syncGeneratedSourceFromDesign();setDirty(true);
  }
  function getSelected(){const f=currentForm();return f?.components.find(i=>i.id===state.selectedId)||null;}

  function actionHandlerName(item){
    return `${safeVariableName(item?.name,"jButton")}ActionPerformed`;
  }
  function defaultEventBody(item){
    if(!item || item.type!=="JButton") return "";
    if(item.role==='loginSubmit') return 'authenticateUser();';
    if(item.role==='registerSubmit') return 'registerUser();';
    if(item.actionTarget){
      const target=safeClassName(item.actionTarget);
      return `new ${target}().setVisible(true);\ndispose();`;
    }
    return '// START EDITING HERE: add your button code.';
  }
  function normalizeEventCode(value){
    return String(value??'').replace(/\r/g,'').split('\n').map(line=>line.trim()).filter(Boolean).join('\n');
  }
  function extractMethodBody(source,methodName){
    if(!source || !methodName) return null;
    const escaped=methodName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`(?:private|protected|public)\\s+void\\s+${escaped}\\s*\\([^)]*\\)\\s*\\{`);
    const match=re.exec(source);
    if(!match) return null;
    const open=source.indexOf('{',match.index);
    if(open<0) return null;
    let depth=1,i=open+1,stateMode='code';
    for(;i<source.length;i++){
      const ch=source[i],next=source[i+1];
      if(stateMode==='line'){if(ch==='\n')stateMode='code';continue;}
      if(stateMode==='block'){if(ch==='*'&&next==='/'){stateMode='code';i++;}continue;}
      if(stateMode==='string'){if(ch==='\\'){i++;continue;}if(ch==='"')stateMode='code';continue;}
      if(stateMode==='char'){if(ch==='\\'){i++;continue;}if(ch==="'")stateMode='code';continue;}
      if(ch==='/'&&next==='/'){stateMode='line';i++;continue;}
      if(ch==='/'&&next==='*'){stateMode='block';i++;continue;}
      if(ch==='"'){stateMode='string';continue;}
      if(ch==="'"){stateMode='char';continue;}
      if(ch==='{')depth++;
      else if(ch==='}'){depth--;if(depth===0)break;}
    }
    if(depth!==0)return null;
    const raw=source.slice(open+1,i).replace(/^\s*\n/,'').replace(/\n\s*$/,'');
    const lines=raw.split('\n');
    const indents=lines.filter(l=>l.trim()).map(l=>(l.match(/^\s*/)||[''])[0].length);
    const min=indents.length?Math.min(...indents):0;
    return lines.map(l=>l.slice(Math.min(min,l.length))).join('\n');
  }
  function captureEditedEventBodies(form,source){
    if(!form || !source) return;
    (form.components||[]).filter(i=>i.type==='JButton').forEach(item=>{
      const body=extractMethodBody(source,actionHandlerName(item));
      if(body===null)return;
      const last=item.lastGeneratedEventCode;
      if(last==null || normalizeEventCode(body)!==normalizeEventCode(last)){
        item.eventCode=body;
      }
    });
  }
  function extractMethodSource(source,methodName){
    if(!source||!methodName)return null;
    const escaped=methodName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`^[ \t]*(?:private|protected|public)\\s+[^\n{;]*?\\b${escaped}\\s*\\([^)]*\\)\\s*\\{`,'m');
    const match=re.exec(source);if(!match)return null;
    const open=source.indexOf('{',match.index);const close=findMatchingBrace(source,open);if(open<0||close<0)return null;
    return source.slice(match.index,close+1);
  }
  function helperMethodName(form){return form?.templateType==='login-db'?'authenticateUser':form?.templateType==='register-db'?'registerUser':'';}
  function captureEditedHelperMethod(form,source){
    const name=helperMethodName(form);if(!name||!source)return;
    const actual=extractMethodSource(source,name);if(!actual)return;
    form.customHelperMethods=form.customHelperMethods||{};form.lastGeneratedHelperMethods=form.lastGeneratedHelperMethods||{};
    const last=form.lastGeneratedHelperMethods[name];
    let baseline='';
    if(!last){
      const generated=form.templateType==='login-db'?loginMethods(form):registerMethods(form);
      baseline=extractMethodSource(generated,name)||generated;
    }
    const reference=last||baseline;
    if(reference && normalizeEventCode(actual)!==normalizeEventCode(reference))form.customHelperMethods[name]=actual;
  }
  function eventBodyFor(item){
    return item?.eventCode!=null ? String(item.eventCode) : defaultEventBody(item);
  }
  function indentEventBody(body,spaces=8){
    const pad=' '.repeat(spaces);
    return String(body||'').split('\n').map(line=>pad+line).join('\n');
  }

  function populateActionTargets(selected=null){
    const current=selected||getSelected(); if(!els.propActionTarget)return; const value=current?.actionTarget||"";
    els.propActionTarget.innerHTML='<option value="">No form action</option>'+formFiles().filter(n=>n!==state.currentFile).map(n=>`<option value="${escapeHtml(classFromFile(n))}">${escapeHtml(classFromFile(n))}</option>`).join(""); els.propActionTarget.value=value;
  }
  function selectComponent(id){
    state.selectedId=id;const selected=getSelected();$$('.component',els.canvas).forEach(n=>n.classList.toggle('selected',n.dataset.id===id));
    if(els.componentNavigator){$$('.navigator-item',els.componentNavigator).forEach(n=>n.classList.toggle('selected',n.dataset.componentId===id));}
    updateLayerButtons();
    if(!selected){
      els.noSelection.classList.remove('hidden');els.componentProps.classList.add('hidden');els.buttonEventsBlock?.classList.add('hidden');els.iconEditorBlock?.classList.add('hidden');return;
    }
    normalizeComponentDesign(selected);
    els.noSelection.classList.add('hidden');els.componentProps.classList.remove('hidden');els.propType.value=selected.type;els.propName.value=selected.name;els.propText.value=selected.text;els.propX.value=selected.x;els.propY.value=selected.y;els.propW.value=selected.w;els.propH.value=selected.h;
    if(els.propFontFamily)els.propFontFamily.value=selected.fontFamily||'Arial';
    if(els.propFontStyle)els.propFontStyle.value=selected.fontStyle||'plain';
    if(els.propFontSize)els.propFontSize.value=selected.fontSize||14;
    if(els.propForeground)els.propForeground.value=selected.foreground||'#000000';
    if(els.propBackground)els.propBackground.value=selected.background||'#f0f0f0';
    if(els.propOpaque)els.propOpaque.checked=selected.opaque!==false;
    const supportsIcon=selected.type==='JLabel'||selected.type==='JButton';
    els.iconEditorBlock?.classList.toggle('hidden',!supportsIcon);
    if(els.propIconPath)els.propIconPath.value=selected.iconPath||'';
    const isButton=selected.type==='JButton';
    els.actionTargetLabel.classList.toggle('hidden',!isButton);
    els.buttonEventsBlock?.classList.toggle('hidden',!isButton);
    if(isButton){
      populateActionTargets(selected);
      if(els.propActionHandler)els.propActionHandler.value=actionHandlerName(selected);
    }
  }
  function componentCss(item){
    normalizeComponentDesign(item);
    const weight=item.fontStyle==='bold'||item.fontStyle==='bolditalic'?'700':'400';
    const style=item.fontStyle==='italic'||item.fontStyle==='bolditalic'?'italic':'normal';
    const bg=item.opaque?(item.background||'#f0f0f0'):'transparent';
    return `font-family:${String(item.fontFamily||'Arial').replace(/[;{}]/g,'')};font-size:${Math.max(8,Number(item.fontSize)||14)}px;font-weight:${weight};font-style:${style};color:${item.foreground||'#000000'};background-color:${bg};`;
  }
  function componentIconMarkup(item){
    if(item.type!=='JLabel'&&item.type!=='JButton')return '';
    const src=item.iconData||item.iconPath||'';
    return src?`<img class="component-icon" src="${escapeHtml(src)}" alt="">`:'';
  }
  function componentInnerHtml(item,preview=false){
    const text=escapeHtml(item.text),style=componentCss(item),icon=componentIconMarkup(item);
    const isAuthButton=item.role==='loginSubmit'||item.role==='registerSubmit';
    const actionAttr=preview&&item.type==='JButton'&&isAuthButton?` data-auth-action="${item.role==='loginSubmit'?'login':'register'}"`:preview&&item.type==='JButton'&&item.actionTarget?` data-open-form="${escapeHtml(item.actionTarget)}"`:'';
    switch(item.type){
      // The Palette supplies default text only when a component is first created.
      // After that, an intentionally empty Text / Items property must stay empty.
      case'JLabel':return`<label style="${style}">${icon}${text}</label>`;
      case'JTextField':return`<input style="${style}" type="text" value="${text}">`;
      case'JPasswordField':return`<input style="${style}" type="password" value="${text}">`;
      case'JButton':return`<button style="${style}" type="button"${actionAttr}>${icon}${text}</button>`;
      case'JCheckBox':return`<label style="${style}"><input type="checkbox">${text?` ${text}`:''}</label>`;
      case'JRadioButton':return`<label style="${style}"><input type="radio">${text?` ${text}`:''}</label>`;
      case'JTextArea':return`<textarea style="${style}">${text}</textarea>`;
      case'JComboBox':{const o=String(item.text??'').split(',').map(v=>v.trim()).filter(Boolean);return`<select style="${style}">${o.map(v=>`<option>${escapeHtml(v)}</option>`).join('')}</select>`;}
      case'JTable':{const c=String(item.text??'').split(',').map(v=>v.trim()).filter(Boolean);return`<table style="${style}"><thead><tr>${c.map(v=>`<th>${escapeHtml(v)}</th>`).join('')}</tr></thead><tbody>${c.length?`<tr>${c.map(()=>'<td></td>').join('')}</tr><tr>${c.map(()=>'<td></td>').join('')}</tr>`:''}</tbody></table>`;}
      default:return`<div style="${style}">${text}</div>`;
    }
  }
  function layerIcon(type){
    return ({JLabel:'A',JTextField:'▭',JPasswordField:'•••',JButton:'B',JCheckBox:'☑',JRadioButton:'◉',JTextArea:'≡',JComboBox:'▼',JTable:'▦'})[type]||'◆';
  }
  function renderNavigator(){
    if(!els.componentNavigator)return;
    const f=currentForm();
    if(!f){
      els.componentNavigator.innerHTML='<div class="empty">Open a JFrame Form to view its components.</div>';
      [els.bringToFrontBtn,els.moveForwardBtn,els.moveBackwardBtn,els.sendToBackBtn].filter(Boolean).forEach(b=>b.disabled=true);
      return;
    }
    const components=Array.isArray(f.components)?f.components:[];
    const root=`<div class="navigator-root"><span class="navigator-disclosure">▾</span><strong>${escapeHtml(f.className||'JFrame')}</strong><span class="navigator-root-type">JFrame</span></div>`;
    if(!components.length){
      els.componentNavigator.innerHTML=root+'<div class="empty navigator-empty">No components on this form.</div>';
    }else{
      // f.components is stored back -> front. Reverse it so the Navigator matches NetBeans-like visual stacking: front at the top.
      const rows=[...components].reverse().map((item,frontIndex)=>{
        const selected=item.id===state.selectedId?' selected':'';
        const preview=String(item.text??'').trim();
        const textPreview=preview?`<span class="navigator-text">${escapeHtml(preview.length>24?preview.slice(0,24)+'…':preview)}</span>`:'<span class="navigator-text empty-text">(no text)</span>';
        return `<button class="navigator-item${selected}" type="button" data-component-id="${escapeHtml(item.id)}" title="Select ${escapeHtml(item.name)}. Layer ${frontIndex+1} from front."><span class="navigator-type-icon">${layerIcon(item.type)}</span><span class="navigator-item-main"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.type)}</small></span>${textPreview}<span class="navigator-layer">${frontIndex===0?'FRONT':frontIndex+1}</span></button>`;
      }).join('');
      els.componentNavigator.innerHTML=root+`<div class="navigator-children">${rows}</div>`;
      $$('.navigator-item',els.componentNavigator).forEach(row=>row.addEventListener('click',()=>{
        const id=row.dataset.componentId;
        if(!id)return;
        if(currentViewName()!=='design')switchView('design',false);
        selectComponent(id);
      }));
    }
    updateLayerButtons();
  }
  function updateLayerButtons(){
    const f=currentForm(),s=getSelected();
    const count=f?.components?.length||0;
    const index=s?f.components.findIndex(i=>i.id===s.id):-1;
    if(els.bringToFrontBtn)els.bringToFrontBtn.disabled=index<0||index===count-1;
    if(els.moveForwardBtn)els.moveForwardBtn.disabled=index<0||index===count-1;
    if(els.moveBackwardBtn)els.moveBackwardBtn.disabled=index<=0;
    if(els.sendToBackBtn)els.sendToBackBtn.disabled=index<=0;
  }
  function moveSelectedLayer(direction){
    const f=currentForm(),s=getSelected();
    if(!f||!s)return;
    const list=f.components;
    const index=list.findIndex(i=>i.id===s.id);
    if(index<0)return;
    let target=index;
    if(direction==='front')target=list.length-1;
    else if(direction==='forward')target=Math.min(list.length-1,index+1);
    else if(direction==='backward')target=Math.max(0,index-1);
    else if(direction==='back')target=0;
    if(target===index){updateLayerButtons();return;}
    const [item]=list.splice(index,1);
    list.splice(target,0,item);
    state.selectedId=item.id;
    renderComponents();
    syncGeneratedSourceFromDesign();
    setDirty(true);
    const label=direction==='front'?'brought to front':direction==='forward'?'moved one layer forward':direction==='backward'?'moved one layer backward':'sent to back';
    log(`${item.name} ${label}.`,'success');
  }

  function renderComponents(){
    $$('.component',els.canvas).forEach(n=>n.remove());const f=currentForm();if(!f){els.emptyCanvas.classList.remove('hidden');selectComponent(null);renderNavigator();return;}
    f.components.forEach((item,layerIndex)=>{normalizeComponentDesign(item);const node=document.createElement('div');node.className='component';node.dataset.id=item.id;if(item.type==='JButton')node.dataset.buttonEvent='true';Object.assign(node.style,{left:`${item.x}px`,top:`${item.y}px`,width:`${item.w}px`,height:`${item.h}px`,zIndex:String(layerIndex+1)});node.innerHTML=`${componentInnerHtml(item)}<span class="resize" title="Resize"></span>`;
      node.addEventListener('dblclick',e=>{
        if(item.type!=='JButton')return;
        e.preventDefault();e.stopPropagation();selectComponent(item.id);openActionHandler(item);
      });
      node.addEventListener('pointerdown',e=>{if(e.button!==0)return;const resize=e.target.classList.contains('resize');selectComponent(item.id);const sx=e.clientX,sy=e.clientY,start={x:item.x,y:item.y,w:item.w,h:item.h};node.setPointerCapture(e.pointerId);
        const move=m=>{const dx=m.clientX-sx,dy=m.clientY-sy;if(resize){item.w=Math.max(20,Math.round(start.w+dx));item.h=Math.max(18,Math.round(start.h+dy));}else{const maxX=Math.max(0,els.canvas.clientWidth-item.w),maxY=Math.max(0,els.canvas.clientHeight-item.h);item.x=Math.max(0,Math.min(maxX,Math.round(start.x+dx)));item.y=Math.max(0,Math.min(maxY,Math.round(start.y+dy)));}Object.assign(node.style,{left:`${item.x}px`,top:`${item.y}px`,width:`${item.w}px`,height:`${item.h}px`});selectComponent(item.id);setDirty(true);};
        const up=u=>{try{node.releasePointerCapture(u.pointerId);}catch{}node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);syncGeneratedSourceFromDesign();};node.addEventListener('pointermove',move);node.addEventListener('pointerup',up);});els.canvas.appendChild(node);});
    els.emptyCanvas.classList.toggle('hidden',f.components.length>0);selectComponent(state.selectedId);renderNavigator();
  }
  function updateSelectedFromProperties(){
    const s=getSelected();if(!s)return;
    const form=currentForm();const existing=els.codeEditor.value||state.files[state.currentFile]||'';captureEditedEventBodies(form,existing);captureEditedHelperMethod(form,existing);
    s.name=safeVariableName(els.propName.value,s.name);s.text=els.propText.value;s.x=Math.max(0,Number(els.propX.value)||0);s.y=Math.max(0,Number(els.propY.value)||0);s.w=Math.max(20,Number(els.propW.value)||20);s.h=Math.max(18,Number(els.propH.value)||18);
    s.fontFamily=els.propFontFamily?.value||s.fontFamily||'Arial';s.fontStyle=els.propFontStyle?.value||'plain';s.fontSize=Math.max(8,Math.min(72,Number(els.propFontSize?.value)||14));s.foreground=els.propForeground?.value||'#000000';s.background=els.propBackground?.value||'#f0f0f0';s.opaque=els.propOpaque?!!els.propOpaque.checked:true;
    if((s.type==='JLabel'||s.type==='JButton')&&els.propIconPath){const nextIconPath=els.propIconPath.value.trim();if(nextIconPath!==s.iconPath)s.iconData='';s.iconPath=nextIconPath;}
    if(s.type==='JButton')s.actionTarget=els.propActionTarget.value||'';
    renderComponents();syncGeneratedSourceFromDesign();setDirty(true);
  }
  function chooseComponentImage(){
    const s=getSelected();if(!s || (s.type!=='JLabel'&&s.type!=='JButton')){log('Select a JLabel or JButton before choosing an image/icon.','error');return;}
    const picker=document.createElement('input');picker.type='file';picker.accept='image/*';
    picker.onchange=()=>{const file=picker.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{s.iconData=String(reader.result||'');s.iconPath=file.name;els.propIconPath.value=s.iconPath;renderComponents();syncGeneratedSourceFromDesign();setDirty(true);log(`Image/icon ${file.name} added to ${s.name}.`,'success');};reader.readAsDataURL(file);};
    picker.click();
  }
  function clearComponentImage(){
    const s=getSelected();if(!s)return;s.iconPath='';s.iconData='';if(els.propIconPath)els.propIconPath.value='';renderComponents();syncGeneratedSourceFromDesign();setDirty(true);
  }
  function deleteSelected(){const f=currentForm(),s=getSelected();if(!f||!s)return;f.components=f.components.filter(i=>i.id!==s.id);state.selectedId=null;renderComponents();syncGeneratedSourceFromDesign();setDirty(true);log(`${s.type} "${s.name}" deleted.`);}

  function javaDeclaration(i){return`    private ${i.type} ${safeVariableName(i.name)};`;}
  function javaInitialization(i){const n=safeVariableName(i.name),t=escapeJava(i.text);switch(i.type){case'JLabel':return`        ${n} = new JLabel("${t}");`;case'JTextField':return`        ${n} = new JTextField("${t}");`;case'JPasswordField':return`        ${n} = new JPasswordField("${t}");`;case'JButton':return`        ${n} = new JButton("${t}");`;case'JCheckBox':return`        ${n} = new JCheckBox("${t}");`;case'JRadioButton':return`        ${n} = new JRadioButton("${t}");`;case'JTextArea':return`        ${n} = new JTextArea("${t}");`;case'JComboBox':{const v=String(i.text||'').split(',').map(x=>`"${escapeJava(x.trim())}"`).filter(x=>x!=='""').join(', ');return`        ${n} = new JComboBox<>(new String[]{${v}});`;}case'JTable':{const v=String(i.text??'').split(',').map(x=>`"${escapeJava(x.trim())}"`).filter(x=>x!=='""').join(', ');return`        ${n} = new JTable(new Object[][]{}, new String[]{${v}});`;}default:return`        ${n} = new ${i.type}();`;}}
  function hexToRgb(hex){
    const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex||''));
    return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[0,0,0];
  }
  function javaAppearanceStatements(i){
    normalizeComponentDesign(i);
    const n=safeVariableName(i.name), lines=[];
    const style=i.fontStyle==='bold'?'Font.BOLD':i.fontStyle==='italic'?'Font.ITALIC':i.fontStyle==='bolditalic'?'Font.BOLD | Font.ITALIC':'Font.PLAIN';
    const [fr,fg,fb]=hexToRgb(i.foreground),[br,bg,bb]=hexToRgb(i.background);
    lines.push(`        ${n}.setFont(new Font("${escapeJava(i.fontFamily||'Arial')}", ${style}, ${Math.max(8,Number(i.fontSize)||14)}));`);
    lines.push(`        ${n}.setForeground(new Color(${fr}, ${fg}, ${fb}));`);
    if(i.opaque){
      lines.push(`        ${n}.setBackground(new Color(${br}, ${bg}, ${bb}));`);
      if(i.type==='JLabel') lines.push(`        ${n}.setOpaque(true);`);
    }else if(i.type==='JLabel') lines.push(`        ${n}.setOpaque(false);`);
    if((i.type==='JLabel'||i.type==='JButton')&&i.iconPath){
      lines.push(`        ${n}.setIcon(new ImageIcon("${escapeJava(i.iconPath)}"));`);
    }
    return lines;
  }
  function javaAddStatement(i){
    const n=safeVariableName(i.name);const lines=[...javaAppearanceStatements(i)];
    if(i.type==='JTable'||i.type==='JTextArea'){
      lines.push(`        JScrollPane ${n}ScrollPane = new JScrollPane(${n});`,`        ${n}ScrollPane.setBounds(${i.x}, ${i.y}, ${i.w}, ${i.h});`,`        add(${n}ScrollPane);`);
    }else{
      lines.push(`        ${n}.setBounds(${i.x}, ${i.y}, ${i.w}, ${i.h});`,`        add(${n});`);
    }
    if(i.type==='JButton'){
      lines.push('',`        ${n}.addActionListener(this::${actionHandlerName(i)});`);
    }
    return lines.join('\n');
  }

  function javaLayerStatements(components){
    const list=Array.isArray(components)?components:[];
    if(list.length<2)return '';
    return [...list].reverse().map((i,frontIndex)=>{
      const n=safeVariableName(i.name);
      const target=(i.type==='JTable'||i.type==='JTextArea')?`${n}ScrollPane`:n;
      return `        getContentPane().setComponentZOrder(${target}, ${frontIndex});`;
    }).join('\n');
  }

  function javaEventHandlers(form){
    const buttons=(form.components||[]).filter(i=>i.type==='JButton');
    if(!buttons.length)return '';
    return buttons.map(item=>{
      const name=actionHandlerName(item);
      const body=eventBodyFor(item);
      item.lastGeneratedEventCode=body;
      return `    private void ${name}(java.awt.event.ActionEvent evt) {\n${indentEventBody(body,8)}\n    }`;
    }).join('\n\n');
  }

  function roleComponent(form,role,typeFallback="",index=0){
    const exact=(form.components||[]).find(i=>i.role===role);
    if(exact)return exact;
    if(typeFallback){
      const candidates=(form.components||[]).filter(i=>i.type===typeFallback);
      return candidates[index]||null;
    }
    return null;
  }

  function loginMethods(form){
    const user=roleComponent(form,'loginUsername','JTextField',0);
    const pass=roleComponent(form,'loginPassword','JPasswordField',0);
    const button=roleComponent(form,'loginSubmit','JButton',0);
    if(!user||!pass||!button)return '';
    const u=safeVariableName(user.name),p=safeVariableName(pass.name);
    const target=button.actionTarget && state.forms[`${safeClassName(button.actionTarget)}.java`] ? safeClassName(button.actionTarget) : '';
    const table=usersTable();

    return `
    private void authenticateUser() {
        String username = ${u}.getText().trim();
        String password = new String(${p}.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this,
                    "Please enter your username and password.",
                    "Login Required",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String sql = "SELECT id, full_name, username, password_hash FROM ${table} WHERE username = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, username);

            try (ResultSet result = statement.executeQuery()) {
                if (result.next() && PasswordUtil.verifyPassword(password, result.getString("password_hash"))) {
                    String fullName = result.getString("full_name");
                    JOptionPane.showMessageDialog(this,
                            "Login successful. Welcome, " + fullName + "!",
                            "Success",
                            JOptionPane.INFORMATION_MESSAGE);
${target?`                    new ${target}().setVisible(true);
                    dispose();`:''}
                } else {
                    JOptionPane.showMessageDialog(this,
                            "Invalid username or password.",
                            "Login Failed",
                            JOptionPane.ERROR_MESSAGE);
                }
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this,
                    "Database error: " + ex.getMessage(),
                    "Database Error",
                    JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }
    }
`;
  }

  function registerMethods(form){
    const full=roleComponent(form,'registerFullName','JTextField',0);
    const user=roleComponent(form,'registerUsername','JTextField',1);
    const email=roleComponent(form,'registerEmail','JTextField',2);
    const pass=roleComponent(form,'registerPassword','JPasswordField',0);
    const confirm=roleComponent(form,'registerConfirm','JPasswordField',1);
    const button=roleComponent(form,'registerSubmit','JButton',0);
    if(!full||!user||!email||!pass||!confirm||!button)return '';

    const fn=safeVariableName(full.name),u=safeVariableName(user.name),em=safeVariableName(email.name),
          pw=safeVariableName(pass.name),cf=safeVariableName(confirm.name);
    const target=button.actionTarget && state.forms[`${safeClassName(button.actionTarget)}.java`] ? safeClassName(button.actionTarget) : '';
    const table=usersTable();

    return `
    private void registerUser() {
        String fullName = ${fn}.getText().trim();
        String username = ${u}.getText().trim();
        String email = ${em}.getText().trim();
        String password = new String(${pw}.getPassword());
        String confirmPassword = new String(${cf}.getPassword());

        if (fullName.isEmpty() || username.isEmpty() || email.isEmpty()
                || password.isEmpty() || confirmPassword.isEmpty()) {
            JOptionPane.showMessageDialog(this,
                    "Please complete all registration fields.",
                    "Required Fields",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (password.length() < 8) {
            JOptionPane.showMessageDialog(this,
                    "Password must contain at least 8 characters.",
                    "Weak Password",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (!password.equals(confirmPassword)) {
            JOptionPane.showMessageDialog(this,
                    "Password and confirmation do not match.",
                    "Password Mismatch",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        String duplicateSql = "SELECT id FROM ${table} WHERE username = ? OR email = ?";
        String insertSql = "INSERT INTO ${table} (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)";

        try (Connection connection = DBConnection.getConnection()) {
            try (PreparedStatement duplicate = connection.prepareStatement(duplicateSql)) {
                duplicate.setString(1, username);
                duplicate.setString(2, email);

                try (ResultSet result = duplicate.executeQuery()) {
                    if (result.next()) {
                        JOptionPane.showMessageDialog(this,
                                "The username or email is already registered.",
                                "Account Exists",
                                JOptionPane.WARNING_MESSAGE);
                        return;
                    }
                }
            }

            try (PreparedStatement insert = connection.prepareStatement(insertSql)) {
                insert.setString(1, fullName);
                insert.setString(2, username);
                insert.setString(3, email);
                insert.setString(4, PasswordUtil.hashPassword(password));

                int affected = insert.executeUpdate();

                if (affected == 1) {
                    JOptionPane.showMessageDialog(this,
                            "Account created successfully.",
                            "Registration Complete",
                            JOptionPane.INFORMATION_MESSAGE);

                    ${fn}.setText("");
                    ${u}.setText("");
                    ${em}.setText("");
                    ${pw}.setText("");
                    ${cf}.setText("");
${target?`                    new ${target}().setVisible(true);
                    dispose();`:''}
                }
            }
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(this,
                    "Database error: " + ex.getMessage(),
                    "Database Error",
                    JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
        }
    }
`;
  }

  function generateJavaCode(form){
    const f=form||currentForm()||blankForm();normalizeProjectDesignData();
    const c=safeClassName(f.className),title=escapeJava(f.title||c),w=Math.max(400,Number(f.width)||760),h=Math.max(300,Number(f.height)||500),components=Array.isArray(f.components)?f.components:[];
    const dec=components.map(javaDeclaration).join('\n'),init=components.map(javaInitialization).join('\n'),adds=components.map(javaAddStatement).join('\n\n'),layers=javaLayerStatements(components);
    const handlers=javaEventHandlers(f);
    const authType=f.templateType==='login-db'||f.templateType==='register-db';
    const baselineExtraMethods=f.templateType==='login-db'?loginMethods(f):f.templateType==='register-db'?registerMethods(f):'';
    const helperName=helperMethodName(f);
    const extraMethods=helperName&&f.customHelperMethods?.[helperName]?f.customHelperMethods[helperName]:baselineExtraMethods;
    if(helperName){f.lastGeneratedHelperMethods=f.lastGeneratedHelperMethods||{};f.lastGeneratedHelperMethods[helperName]=extraMethods;}
    const imports=authType?'import javax.swing.*;\nimport java.sql.*;\nimport java.awt.*;':'import javax.swing.*;\nimport java.awt.*;';
    const [rr,rg,rb]=hexToRgb(f.backgroundColor||'#f3f3f3');

    return`${imports}\n\npublic class ${c} extends JFrame {\n${dec?'\n'+dec+'\n':''}\n    public ${c}() {\n        setTitle("${title}");\n        setSize(${w}, ${h});\n        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);\n        setResizable(${f.resizable!==false?'true':'false'});\n        setLocationRelativeTo(null);\n        setLayout(null);\n        getContentPane().setBackground(new Color(${rr}, ${rg}, ${rb}));\n\n${init||'        // Add Swing components from the Design tab.'}${adds?'\n\n'+adds:''}${layers?'\n\n        // Component layer order: z-order 0 is the front-most Swing component.\n'+layers:''}\n    }\n\n${handlers}${handlers?'\n':''}${extraMethods}\n    public static void main(String[] args) {\n        SwingUtilities.invokeLater(() -> new ${c}().setVisible(true));\n    }\n}\n`;
  }

  function syncGeneratedSourceFromDesign(){
    if(!isFormFile())return;
    const f=currentForm();if(!f)return;
    const existing=els.codeEditor.value||state.files[state.currentFile]||'';
    captureEditedEventBodies(f,existing);
    captureEditedHelperMethod(f,existing);
    state.files[state.currentFile]=generateJavaCode(f);
    els.codeEditor.value=state.files[state.currentFile];
    els.currentFileLabel.textContent=state.currentFile;
    if(state.foldView)renderFoldedCode();
  }

  function generateCurrentForm(switchToSource=true){
    if(!isFormFile()){log('The current file is not a JFrame Form.','error');return;}
    syncFormFromInputs();upgradeAuthMetadata();autoLinkAuthForms();const f=currentForm();
    if(f.templateType==='login-db'||f.templateType==='register-db')ensureAuthSupportFiles(false);
    syncGeneratedSourceFromDesign();
    if(switchToSource)switchView('source');setDirty(true);log(`Generated ${state.currentFile} from its Design canvas.`,"success");
  }

  function showEventEditNotice(item,handler){
    if(!els.eventEditNotice)return;
    els.eventEditTitle.textContent=`Editing ${handler}(...)`;
    const auth=item?.role==='loginSubmit'?' Keep authenticateUser() for the database login; add extra code before or after that call.':item?.role==='registerSubmit'?' Keep registerUser() for database registration; add extra code before or after that call.':'';
    els.eventEditText.textContent=`The Source editor is positioned directly inside this ActionPerformed method. This is where you edit the button behavior.${auth}`;
    els.eventEditNotice.classList.remove('hidden');
  }
  function hideEventEditNotice(){els.eventEditNotice?.classList.add('hidden');}

  function openActionHandler(item=getSelected()){
    if(!item || item.type!=='JButton'){log('Select a JButton to open its ActionPerformed event.','error');return;}
    if(!isFormFile()){log('Open a JFrame Form first.','error');return;}
    state.selectedId=item.id;
    syncFormFromInputs();
    syncGeneratedSourceFromDesign();
    const handler=actionHandlerName(item);
    const source=els.codeEditor.value;
    const methodIdx=source.indexOf(`void ${handler}(`);
    setFoldView(false);
    switchView('source');
    if(methodIdx>=0){
      const brace=source.indexOf('{',methodIdx),close=findMatchingBrace(source,brace);
      let a=brace+1,b=close;
      if(brace>=0&&close>brace){
        const inner=source.slice(brace+1,close);
        const lead=(inner.match(/^\s*/)||[''])[0].length;
        const trail=(inner.match(/\s*$/)||[''])[0].length;
        a=brace+1+lead;b=Math.max(a,close-trail);
      }
      els.codeEditor.focus();
      const selectEnd=(item.role==='loginSubmit'||item.role==='registerSubmit'||item.actionTarget)?a:b;
      els.codeEditor.setSelectionRange(a,selectEnd);
      const line=source.slice(0,a).split('\n').length-1;
      const style=getComputedStyle(els.codeEditor);
      const lineHeight=parseFloat(style.lineHeight)||21.7;
      els.codeEditor.scrollTop=Math.max(0,line*lineHeight-120);
      els.codeEditor.classList.remove('source-jump-flash');
      void els.codeEditor.offsetWidth;
      els.codeEditor.classList.add('source-jump-flash');
      state.uiState[state.currentFile]=Object.assign({},state.uiState[state.currentFile]||{},{view:'source',selectionStart:a,selectionEnd:selectEnd,codeScrollTop:els.codeEditor.scrollTop});
      showEventEditNotice(item,handler);
      log(`Opened ${handler}(...). The cursor is now inside the exact button event code.`,'success');
    }else{
      log(`Could not locate ${handler} in the generated source.`,'error');
    }
  }

  function buildDbConnectionCode(){
    const host=escapeJava(els.dbHost.value.trim()||'localhost'),
          port=escapeJava(els.dbPort.value.trim()||'3306'),
          db=escapeJava(els.dbName.value.trim()||'student_system'),
          user=escapeJava(els.dbUser.value),
          pass=escapeJava(els.dbPass.value);
    return`import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL =
            "jdbc:mysql://${host}:${port}/${db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = "${user}";
    private static final String PASSWORD = "${pass}";

    private DBConnection() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
`;
  }

  function buildPasswordUtilCode(){
    return`import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public final class PasswordUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int ITERATIONS = 120000;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_BYTES = 16;

    private PasswordUtil() {
    }

    public static String hashPassword(String password) {
        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        byte[] hash = pbkdf2(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);

        return ITERATIONS + ":"
                + Base64.getEncoder().encodeToString(salt) + ":"
                + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean verifyPassword(String password, String storedHash) {
        if (storedHash == null || storedHash.trim().isEmpty()) {
            return false;
        }

        try {
            String[] parts = storedHash.split(":");
            if (parts.length != 3) {
                return false;
            }

            int iterations = Integer.parseInt(parts[0]);
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] expected = Base64.getDecoder().decode(parts[2]);
            byte[] actual = pbkdf2(password.toCharArray(), salt, iterations, expected.length * 8);

            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations, int keyLength) {
        PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, keyLength);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash password.", ex);
        } finally {
            spec.clearPassword();
        }
    }
}
`;
  }

  function buildAuthSql(){
    const db=databaseName(),table=usersTable();
    return`-- Authentication database setup generated by Java JFrame Practice IDE
CREATE DATABASE IF NOT EXISTS \`${db}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`${db}\`;

CREATE TABLE IF NOT EXISTS \`${table}\` (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Passwords are created by RegisterForm.java using PasswordUtil.java (PBKDF2).
-- Do not store plain-text passwords in this table.
`;
  }

  function ensureAuthSupportFiles(openFile=true){
    if(!state.projectName)newProject('JavaJFrameProject');
    if(isFormFile())syncFormFromInputs();else syncEditor();

    const created=[];
    if(state.files['DBConnection.java']===undefined){state.files['DBConnection.java']=buildDbConnectionCode();created.push('DBConnection.java');}
    if(state.files['PasswordUtil.java']===undefined){state.files['PasswordUtil.java']=buildPasswordUtilCode();created.push('PasswordUtil.java');}
    if(state.files['database_setup.sql']===undefined){state.files['database_setup.sql']=buildAuthSql();created.push('database_setup.sql');}

    renderProjectTree();setDirty(true);
    if(created.length)log(`Authentication support created: ${created.join(', ')}.`,"success");
    else log('Authentication support files already exist.');

    if(openFile){
      state.currentFile='database_setup.sql';state.selectedId=null;loadCurrentFile({preferDesign:false});switchView('source');
    }
  }

  function addDbConnectionFile(){
    if(!state.projectName)newProject('JavaJFrameProject');
    if(isFormFile())generateCurrentForm(false);else syncEditor();
    state.files['DBConnection.java']=buildDbConnectionCode();state.currentFile='DBConnection.java';state.selectedId=null;
    loadCurrentFile({preferDesign:false});switchView('source');setDirty(true);
    log('DBConnection.java generated. Add MySQL Connector/J to the real Java project classpath.',"success");
  }

  function setCurrentAsMain(){if(!state.currentFile?.endsWith('.java'))return;state.mainClass=classFromFile(state.currentFile);els.mainClassInput.value=state.mainClass;renderProjectTree();setDirty(true);log(`${state.mainClass} is now the project main class.`,"success");}
  function confirmDeleteFile(fileName){
    if(!state.projectName||!fileName||state.files[fileName]===undefined)return;
    const names=Object.keys(state.files);
    if(names.length<=1){log('A project must contain at least one file.','error');return;}

    const doomed=fileName;
    showModal('Delete File',`<div class="content">
      <p>Delete <strong>${escapeHtml(doomed)}</strong> from this practice project?</p>
      <p class="notice">This removes the file from the IDE project stored in your browser. Save the project after deleting.</p>
      <div class="actions"><button id="cancelDeleteFile" type="button">Cancel</button><button id="confirmDeleteFile" class="danger" type="button">Delete File</button></div>
    </div>`);

    $('#cancelDeleteFile',els.modalBody).onclick=closeModal;
    $('#confirmDeleteFile',els.modalBody).onclick=()=>{
      const doomedClass=classFromFile(doomed);
      delete state.files[doomed];
      delete state.forms[doomed];
      delete state.uiState[doomed];

      Object.values(state.forms).forEach(f=>{
        (f.components||[]).forEach(i=>{
          if(i.actionTarget===doomedClass)i.actionTarget='';
        });
      });

      const remaining=Object.keys(state.files);
      if(doomedClass===state.mainClass){
        const nextJava=remaining.find(n=>n.toLowerCase().endsWith('.java'))||remaining[0];
        state.mainClass=classFromFile(nextJava);
      }
      if(state.currentFile===doomed) state.currentFile=remaining[0];

      els.mainClassInput.value=state.mainClass;
      closeModal();
      loadCurrentFile({preferDesign:isFormFile(),restoreView:true});
      Object.keys(state.forms).forEach(name=>{state.files[name]=generateJavaCode(state.forms[name]);});
      renderProjectTree();
      setDirty(true);
      log(`${doomed} deleted from the project.`,"success");
    };
  }

  function deleteCurrentFile(){ confirmDeleteFile(state.currentFile); }

  function compileCheck(){
    if(!state.projectName){log('Create or open a project first.','error');return;}if(isFormFile())generateCurrentForm(false);else syncEditor();state.mainClass=safeClassName(els.mainClassInput.value);els.mainClassInput.value=state.mainClass;
    const candidates=Object.entries(state.files).filter(([n])=>n.endsWith('.java'));const issues=[];
    candidates.forEach(([n,s])=>{const o=(s.match(/{/g)||[]).length,c=(s.match(/}/g)||[]).length;if(o!==c)issues.push(`${n}: unbalanced braces (${o} opening, ${c} closing).`);});
    formFiles().forEach(name=>{const f=state.forms[name];(f.components||[]).forEach(i=>{if(i.type==='JButton'&&i.actionTarget&&!state.files[`${safeClassName(i.actionTarget)}.java`])issues.push(`${name}: button ${i.name} targets missing form ${i.actionTarget}.`);});
      if((f.templateType==='login-db'||f.templateType==='register-db')&&!state.files['DBConnection.java'])issues.push(`${name}: DBConnection.java is required for database authentication.`);
      if((f.templateType==='login-db'||f.templateType==='register-db')&&!state.files['PasswordUtil.java'])issues.push(`${name}: PasswordUtil.java is required for password hashing.`);
    });
    const main=candidates.find(([,s])=>new RegExp(`\\bclass\\s+${state.mainClass}\\b`).test(s)&&/\bstatic\s+void\s+main\s*\(/.test(s));if(!main)issues.push(`Main class "${state.mainClass}" with public static void main(...) was not found.`);
    if(issues.length){replaceOutput('Browser compile check failed:\n- '+issues.join('\n- '));return false;}
    replaceOutput(`Browser compile check passed for ${candidates.length} Java file(s).\nMain class: ${state.mainClass}\nJFrame forms: ${formFiles().length}\n\nThis browser validates source structure and previews Swing forms. Real javac/JVM execution still requires a JDK/NetBeans or a secured server compiler.`);return true;
  }

  function previewFormByClass(className){const file=`${safeClassName(className)}.java`;if(!state.forms[file]){log(`Preview target ${className} was not found.`,`error`);return;}showPreview(file);}
  function showPreview(fileName=state.currentFile){
    const f=state.forms[fileName];if(!f){log('Open a JFrame Form before previewing.','error');return;}
    showModal(`JFrame Preview - ${f.className}`,`<div class="preview-box"><div style="width:${f.width}px;max-width:none;margin:auto"><div class="fake-title"><span>${escapeHtml(f.title)}</span><span>— □ ×</span></div><div class="preview-frame" style="width:${f.width}px;height:${f.height}px;background:${escapeHtml(f.backgroundColor||'#f3f3f3')}">${f.components.map((i,layerIndex)=>`<div class="preview-component" style="left:${i.x}px;top:${i.y}px;width:${i.w}px;height:${i.h}px;z-index:${layerIndex+1}">${componentInnerHtml(i,true)}</div>`).join('')}</div></div></div>`);
    $$('[data-open-form]',els.modalBody).forEach(b=>b.addEventListener('click',()=>{const target=b.dataset.openForm;closeModal();previewFormByClass(target);}));
    $$('[data-auth-action]',els.modalBody).forEach(b=>b.addEventListener('click',()=>{log(`Preview only: ${b.dataset.authAction} uses JDBC in the generated Java application. Open the Source tab to see the database code.`,"info");}));
  }
  function runProject(){if(!state.projectName){log('Create or open a project first.','error');return;}const ok=compileCheck();if(!ok)return;const file=`${state.mainClass}.java`;if(state.forms[file]){showPreview(file);log(`Running visual preview from main form ${state.mainClass}.`,"success");}else{log(`Main class ${state.mainClass} is source-only. A real JDK/JVM is required to execute it.`);}}

  async function copySource(){try{await navigator.clipboard.writeText(els.codeEditor.value);log('Source code copied.',"success");}catch{els.codeEditor.focus();els.codeEditor.select();document.execCommand('copy');log('Source code copied.',"success");}}
  async function testDatabase(){const payload={host:els.dbHost.value.trim()||'localhost',port:els.dbPort.value.trim()||'3306',database:els.dbName.value.trim(),user:els.dbUser.value,password:els.dbPass.value,usersTable:usersTable()};if(!payload.database){log('Enter a database name first.','error');return;}log(`Testing MySQL connection to ${payload.host}:${payload.port}/${payload.database}...`);try{const response=await fetch('api/test-db.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{throw new Error('The PHP endpoint did not return JSON.');}if(!response.ok||!data.ok)throw new Error(data.message||'Database connection failed.');log(data.message||'Database connection successful.',"success");}catch(e){log(`Database test failed: ${e.message}\nIf you are using Live Server on port 5500, PHP will NOT execute. Open this project through XAMPP Apache (for example http://localhost/your-folder/IDE/) to use test-db.php.`,"error");}}
  function refreshFiles(){if(isFormFile())generateCurrentForm(false);else syncEditor();renderProjectTree();populateActionTargets();log('Project file list refreshed.');}
  function showHelp(){showModal('IDE Help',`<div class="content"><p><strong>Button event editing:</strong> double-click any JButton in Design. The IDE opens Source, highlights the exact ActionPerformed body, and shows where you should start typing.</p><p><strong>Live Design → Source:</strong> moving/resizing controls or changing text, font, colors, image/icon, form size, background, or button navigation immediately regenerates the Swing source while preserving edited button event bodies.</p><p><strong>Save / Continue later:</strong> projects auto-save in the browser. Save stores the project locally, while <em>Save As File</em> creates a .jframeide.json project file. Open Project restores the last file, tab, cursor and source scroll position.</p><p><strong>Mini System Templates:</strong> New Project can generate a complete Inventory Management or Student Record starter system with Login, Dashboard, CRUD forms, JDBC support files, and MySQL setup SQL.</p><p><strong>Multi-form project:</strong> use <em>+ New File / JFrame</em> to add Login, Register, Dashboard, Inventory, Student Record, generic CRUD, and other JFrame forms.</p><p><strong>Database:</strong> choose the Login or Register MySQL template. The IDE generates DBConnection.java, PasswordUtil.java, and database_setup.sql. Import MySQL Connector/J into the real NetBeans project.</p><p><strong>Code folding:</strong> use <em>Minimize Generated</em> to collapse imports, fields, constructor/init code, and main. Use <em>Maximize All</em> to expand every section.</p><p><strong>Navigator / Layers:</strong> the Navigator lists front-most components at the top. Select a component and use Front, Forward, Backward, or Back to control overlap. The generated Swing source preserves the same z-order.</p><p><strong>Output:</strong> use Hide/Show or Maximize/Restore in the Output title bar.</p><p class="notice">Real Swing execution still requires Java/JDK. The browser Run button provides an interactive form preview, including navigation between designed JFrame forms.</p></div>`);}

  function toggleOutputPanel(){
    if(!els.outputPanel)return;
    const collapsed=els.outputPanel.classList.toggle('collapsed');
    if(collapsed)els.outputPanel.classList.remove('maximized');
    if(els.toggleOutputBtn)els.toggleOutputBtn.textContent=collapsed?'+ Show':'− Hide';
    if(els.maximizeOutputBtn)els.maximizeOutputBtn.textContent='□ Maximize';
  }
  function toggleOutputMaximize(){
    if(!els.outputPanel)return;
    els.outputPanel.classList.remove('collapsed');
    if(els.toggleOutputBtn)els.toggleOutputBtn.textContent='− Hide';
    const max=els.outputPanel.classList.toggle('maximized');
    if(els.maximizeOutputBtn)els.maximizeOutputBtn.textContent=max?'↙ Restore':'□ Maximize';
  }

  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchView(t.dataset.view)));
  $$('.palette button').forEach(b=>{b.addEventListener('click',()=>{const f=currentForm();const i=f?.components.length||0;createComponent(b.dataset.type,30+(i%6)*18,30+(i%6)*18);});b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',b.dataset.type);e.dataTransfer.effectAllowed='copy';});});
  els.canvas.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});
  els.canvas.addEventListener('drop',e=>{e.preventDefault();const type=e.dataTransfer.getData('text/plain');if(!componentDefaults[type])return;const r=els.canvas.getBoundingClientRect();createComponent(type,e.clientX-r.left,e.clientY-r.top);});
  els.canvas.addEventListener('pointerdown',e=>{if(e.target===els.canvas){state.selectedId=null;selectComponent(null);}});

  [els.className,els.frameTitle,els.frameWidth,els.frameHeight,els.frameBackground,els.frameResizable].filter(Boolean).forEach(i=>{
    i.addEventListener('change',updateFrame);
  });
  els.frameTitle?.addEventListener('input',()=>{const f=currentForm();if(!f)return;f.title=els.frameTitle.value||f.className;els.frameTitleDisplay.textContent=f.title;syncGeneratedSourceFromDesign();setDirty(true);});
  els.frameBackground?.addEventListener('input',()=>{const f=currentForm();if(!f)return;f.backgroundColor=els.frameBackground.value;updateFrameVisual();syncGeneratedSourceFromDesign();setDirty(true);});

  [els.propName,els.propText,els.propX,els.propY,els.propW,els.propH,els.propFontFamily,els.propFontStyle,els.propFontSize,els.propForeground,els.propBackground,els.propOpaque,els.propIconPath,els.propActionTarget].filter(Boolean).forEach(i=>i.addEventListener('change',updateSelectedFromProperties));
  [els.propText,els.propFontSize,els.propForeground,els.propBackground].filter(Boolean).forEach(i=>i.addEventListener('input',()=>{const s=getSelected();if(!s)return;if(i===els.propText)s.text=i.value;else if(i===els.propFontSize)s.fontSize=Math.max(8,Math.min(72,Number(i.value)||14));else if(i===els.propForeground)s.foreground=i.value;else if(i===els.propBackground)s.background=i.value;renderComponents();syncGeneratedSourceFromDesign();setDirty(true);}));

  els.newProjectBtn.onclick=showNewProjectDialog;
  els.openProjectBtn.onclick=showOpenProjectDialog;
  els.saveBtn.onclick=saveProject;
  if(els.saveAsBtn)els.saveAsBtn.onclick=saveProjectAsFile;
  els.newFileBtn.onclick=showNewFileDialog;els.treeNewFileBtn.onclick=showNewFileDialog;els.deleteFileBtn.onclick=deleteCurrentFile;els.setMainBtn.onclick=setCurrentAsMain;els.compileBtn.onclick=compileCheck;els.runBtn.onclick=runProject;els.previewBtn.onclick=()=>showPreview();els.addDbBtn.onclick=addDbConnectionFile;els.addAuthBtn.onclick=()=>ensureAuthSupportFiles(true);els.refreshFilesBtn.onclick=refreshFiles;els.foldModeBtn.onclick=toggleFoldView;els.collapseGeneratedBtn.onclick=collapseGeneratedCode;els.expandAllCodeBtn.onclick=expandAllCode;els.generateBtn.onclick=()=>generateCurrentForm(true);els.copyBtn.onclick=copySource;els.openEventHandlerBtn.onclick=()=>openActionHandler();els.deleteComponentBtn.onclick=deleteSelected;els.generateAuthBtn.onclick=()=>ensureAuthSupportFiles(true);els.testDbBtn.onclick=testDatabase;els.clearOutputBtn.onclick=()=>replaceOutput('Output cleared.');
  if(els.chooseIconBtn)els.chooseIconBtn.onclick=chooseComponentImage;
  if(els.clearIconBtn)els.clearIconBtn.onclick=clearComponentImage;
  if(els.toggleOutputBtn)els.toggleOutputBtn.onclick=toggleOutputPanel;
  if(els.maximizeOutputBtn)els.maximizeOutputBtn.onclick=toggleOutputMaximize;
  if(els.closeEventNoticeBtn)els.closeEventNoticeBtn.onclick=hideEventEditNotice;
  if(els.bringToFrontBtn)els.bringToFrontBtn.onclick=()=>moveSelectedLayer('front');
  if(els.moveForwardBtn)els.moveForwardBtn.onclick=()=>moveSelectedLayer('forward');
  if(els.moveBackwardBtn)els.moveBackwardBtn.onclick=()=>moveSelectedLayer('backward');
  if(els.sendToBackBtn)els.sendToBackBtn.onclick=()=>moveSelectedLayer('back');

  els.codeEditor.addEventListener('input',()=>{if(state.projectName&&state.currentFile){state.files[state.currentFile]=els.codeEditor.value;captureCurrentFileUI();setDirty(true);}});
  ['scroll','click','keyup','select'].forEach(type=>els.codeEditor.addEventListener(type,()=>captureCurrentFileUI(),{passive:type==='scroll'}));
  els.designerWrap?.addEventListener('scroll',()=>captureCurrentFileUI(),{passive:true});
  els.mainClassInput.addEventListener('change',()=>{state.mainClass=safeClassName(els.mainClassInput.value);els.mainClassInput.value=state.mainClass;renderProjectTree();setDirty(true);});
  els.modalClose.onclick=closeModal;els.modal.addEventListener('click',e=>{if(e.target===els.modal)closeModal();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!els.modal.classList.contains('hidden'))closeModal();
    if((e.ctrlKey||e.metaKey)&&(e.key===']'||e.key==='[')&&isFormFile()&&getSelected()){
      e.preventDefault();
      if(e.key===']')moveSelectedLayer(e.shiftKey?'front':'forward');
      else moveSelectedLayer(e.shiftKey?'back':'backward');
      return;
    }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){
      e.preventDefault();
      if(e.shiftKey)saveProjectAsFile();else saveProject();
    }
  });
  window.addEventListener('beforeunload',()=>{captureCurrentFileUI();persistProjectQuietly();});
  $$('.menubar button').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.menu;if(m==='file')showNewFileDialog();else if(m==='source')isFormFile()?generateCurrentForm(true):switchView('source');else if(m==='run')runProject();else if(m==='database')addDbConnectionFile();else if(m==='help')showHelp();else if(m==='view')switchView('design');else log(`${b.textContent} menu selected.`);}));

  migrateOldProjects(); const saved=getProjects(),names=Object.keys(saved); if(names.length){const newest=names.sort((a,b)=>new Date(saved[b].savedAt||0)-new Date(saved[a].savedAt||0))[0];applyProject(saved[newest]);replaceOutput(`Restored saved project "${newest}".\nYou can now add more JFrame forms with + New File / JFrame.`);}else{newProject('JavaJFrameProject');setDirty(false);}
})();
