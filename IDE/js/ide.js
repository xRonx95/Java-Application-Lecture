(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const els = {
    newProjectBtn: $("#newProjectBtn"), openProjectBtn: $("#openProjectBtn"), saveBtn: $("#saveBtn"),
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
    frameWidth: $("#frameWidth"), frameHeight: $("#frameHeight"), frameTitleDisplay: $("#frameTitleDisplay"),
    noSelection: $("#noSelection"), componentProps: $("#componentProps"), propType: $("#propType"),
    propName: $("#propName"), propText: $("#propText"), propX: $("#propX"), propY: $("#propY"),
    propW: $("#propW"), propH: $("#propH"), actionTargetLabel: $("#actionTargetLabel"),
    propActionTarget: $("#propActionTarget"), buttonEventsBlock: $("#buttonEventsBlock"),
    propActionHandler: $("#propActionHandler"), openEventHandlerBtn: $("#openEventHandlerBtn"), deleteComponentBtn: $("#deleteComponentBtn"),
    dbHost: $("#dbHost"), dbPort: $("#dbPort"), dbName: $("#dbName"), dbUser: $("#dbUser"), dbPass: $("#dbPass"), dbUsersTable: $("#dbUsersTable"),
    generateAuthBtn: $("#generateAuthBtn"), testDbBtn: $("#testDbBtn"), clearOutputBtn: $("#clearOutputBtn"), output: $("#output"),
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
    foldView: false
  };

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
  function setDirty(v=true){ state.dirty=v; document.title=`${v?"* ":""}Java JFrame Practice IDE`; }
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

  function renderFoldedCode({focusHandler=''}={}){
    if(!els.foldedCodeView) return;
    const source=els.codeEditor.value||'';
    const sections=parseJavaFoldSections(source);
    els.foldedCodeView.innerHTML='';

    const intro=document.createElement('div');
    intro.className='folded-code-note';
    intro.innerHTML='<strong>Code Folding View</strong><span>Collapse generated sections and keep event/database code visible. Click Edit on any section to return to the full editable source.</span>';
    els.foldedCodeView.appendChild(intro);

    if(!sections.length){
      const empty=document.createElement('div'); empty.className='empty'; empty.textContent='No foldable Java code was found.'; els.foldedCodeView.appendChild(empty); return;
    }

    sections.forEach((section,index)=>{
      const details=document.createElement('details');
      details.className=`code-fold-section fold-${section.kind}`;
      details.dataset.generated=section.generated?'true':'false';
      details.dataset.name=section.name||'';
      details.dataset.start=String(section.start);
      details.dataset.end=String(section.end);
      details.open=focusHandler ? section.name===focusHandler : section.open;

      const summary=document.createElement('summary');
      const title=document.createElement('span'); title.className='fold-summary-title'; title.textContent=section.label;
      const meta=document.createElement('span'); meta.className='fold-summary-meta'; meta.textContent=`${String(section.text||'').split('\n').length} lines`;
      const edit=document.createElement('button'); edit.type='button'; edit.className='fold-edit-btn'; edit.textContent='Edit'; edit.title='Open this section in the full source editor';
      edit.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();focusFullSource(section.start,section.end);});
      summary.append(title,meta,edit);

      const pre=document.createElement('pre'); pre.className='fold-code'; pre.textContent=section.text||'';
      details.append(summary,pre);
      els.foldedCodeView.appendChild(details);
    });

    if(focusHandler){
      requestAnimationFrame(()=>{
        const target=[...els.foldedCodeView.querySelectorAll('.code-fold-section')].find(d=>d.dataset.name===focusHandler);
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
    syncEditor();
    if(isFormFile()) syncFormFromInputs();
    return {name:state.projectName,currentFile:state.currentFile,mainClass:state.mainClass,files:state.files,forms:state.forms,savedAt:new Date().toISOString()};
  }
  function applyProject(data){
    state.projectName=data.name||"JavaProject"; state.files=data.files||{}; state.forms=data.forms||{};
    state.mainClass=safeClassName(data.mainClass||"MainForm");
    state.currentFile=data.currentFile && state.files[data.currentFile]!==undefined ? data.currentFile : Object.keys(state.files)[0]||"MainForm.java";
    state.selectedId=null; els.mainClassInput.value=state.mainClass;
    upgradeAuthMetadata(); autoLinkAuthForms(); updateActiveProjectLabel(); renderProjectTree(); loadCurrentFile({preferDesign:true}); setDirty(false);
  }

  function blankForm(className="MainForm",title="Main Form"){
    return {className:safeClassName(className),title:title||className,width:760,height:500,components:[],counter:0};
  }
  function component(type,name,text,x,y,w,h,actionTarget="",role=""){
    return {id:`component-${Date.now()}-${Math.random().toString(16).slice(2)}`,type,name,text,x,y,w,h,actionTarget,role,eventCode:null,lastGeneratedEventCode:null};
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


  function newProject(name="JavaJFrameProject"){
    state.projectName=String(name||"").trim()||"JavaJFrameProject"; state.mainClass="MainForm"; state.currentFile="MainForm.java";
    state.forms={"MainForm.java":blankForm("MainForm","Main Form")}; state.files={};
    state.files["MainForm.java"]=generateJavaCode(state.forms["MainForm.java"]); state.selectedId=null;
    els.mainClassInput.value=state.mainClass; updateActiveProjectLabel(); renderProjectTree(); loadCurrentFile({preferDesign:true}); setDirty(true);
    replaceOutput(`Project "${state.projectName}" created.\nUse + New File / JFrame to add LoginForm, DashboardForm, StudentForm, and other windows.`);
  }
  function saveProject(){
    if(!state.projectName){showNewProjectDialog();return;}
    if(isFormFile()) generateCurrentForm(false); else syncEditor();
    const projects=getProjects(); projects[state.projectName]=serializeProject(); putProjects(projects); setDirty(false); renderProjectTree();
    log(`Project "${state.projectName}" saved with ${javaFiles().length} Java file(s).`,"success");
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

  function loadCurrentFile({preferDesign=false}={}){
    state.selectedId=null; els.currentFileLabel.textContent=state.currentFile; els.activeFileBadge.textContent=state.currentFile;
    els.codeEditor.value=state.files[state.currentFile]??"";
    if(state.foldView) renderFoldedCode();
    if(isFormFile()){
      const f=currentForm(); els.className.value=f.className; els.frameTitle.value=f.title; els.frameWidth.value=f.width; els.frameHeight.value=f.height;
      updateFrameVisual(); renderComponents(); setFormPanelsEnabled(true); els.nonFormNotice.classList.add("hidden"); els.designerWrap.classList.remove("hidden");
      if(preferDesign) switchView("design");
    } else {
      renderComponents(); setFormPanelsEnabled(false); els.nonFormNotice.classList.remove("hidden"); els.designerWrap.classList.add("hidden");
      if(preferDesign) switchView("source");
    }
    populateActionTargets(); renderProjectTree();
  }
  function openVirtualFile(fileName){
    if(!fileName || state.files[fileName]===undefined)return;
    if(isFormFile()) generateCurrentForm(false); else syncEditor();
    state.currentFile=fileName; loadCurrentFile({preferDesign:isFormFile(fileName)}); log(`Opened ${fileName}.`);
  }
  function setFormPanelsEnabled(enabled){
    els.framePropertiesPanel.classList.toggle("disabled-panel",!enabled); els.componentPanel.classList.toggle("disabled-panel",!enabled);
    els.generateBtn.disabled=!enabled; els.previewBtn.disabled=!enabled;
  }

  function showModal(title,html){els.modalTitle.textContent=title;els.modalBody.innerHTML=html;els.modal.classList.remove("hidden");}
  function closeModal(){els.modal.classList.add("hidden");els.modalBody.innerHTML="";}
  function showNewProjectDialog(){
    showModal("Create Java Project",`<div class="content"><label>Project Name<input id="newProjectName" value="JavaJFrameProject" autocomplete="off"></label><div class="actions"><button id="cancelNewProject" type="button">Cancel</button><button id="createProjectConfirm" type="button">Create Project</button></div></div>`);
    const input=$("#newProjectName",els.modalBody); input.focus(); input.select();
    $("#cancelNewProject",els.modalBody).onclick=closeModal; $("#createProjectConfirm",els.modalBody).onclick=()=>{newProject(input.value);closeModal();};
    input.onkeydown=e=>{if(e.key==="Enter"){newProject(input.value);closeModal();}};
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
      <label id="templateLabel">JFrame Template<select id="newFormTemplate"><option value="blank">Blank JFrame</option><option value="login-db">Login Form - MySQL Database</option><option value="register-db">Register / Signup - MySQL Database</option><option value="dashboard">Dashboard - Professional JFrame</option><option value="data">Data Entry / CRUD Form</option></select></label>
      <div class="actions"><button id="cancelNewFile" type="button">Cancel</button><button id="createNewFile" type="button">Create File</button></div>
    </div>`);
    const classInput=$("#newFileClass",els.modalBody), titleInput=$("#newWindowTitle",els.modalBody), titleLabel=$("#newWindowTitleLabel",els.modalBody), templateLabel=$("#templateLabel",els.modalBody), templateSelect=$("#newFormTemplate",els.modalBody);
    const updateKind=()=>{const kind=$("input[name='fileKind']:checked",els.modalBody).value; const form=kind==="form"; titleLabel.classList.toggle("hidden",!form); templateLabel.classList.toggle("hidden",!form);};
    const applyTemplateDefaults=()=>{
      const presets={
        "login-db":["LoginForm","Login"],
        "register-db":["RegisterForm","Create Account"],
        "dashboard":["DashboardForm","System Dashboard"],
        "data":["StudentForm","Student Management"]
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
      let f=template==="login-db"?loginTemplate(className,title):template==="register-db"?registerTemplate(className,title):template==="dashboard"?dashboardTemplate(className,title):template==="data"?dataEntryTemplate(className,title):blankForm(className,title);
      if(template==="login-db" || template==="register-db") ensureAuthSupportFiles(false);
      state.forms[fileName]=f; upgradeAuthMetadata(); autoLinkAuthForms(); state.files[fileName]=generateJavaCode(f); state.currentFile=fileName; state.selectedId=null; closeModal(); loadCurrentFile({preferDesign:true}); setDirty(true); log(`${fileName} JFrame Form created.`,"success");
    };
    classInput.focus(); classInput.select();
  }

  function showOpenProjectDialog(){
    const projects=getProjects(),names=Object.keys(projects).sort();
    const list=names.length?`<div class="project-list">${names.map(n=>`<button type="button" data-project="${escapeHtml(n)}"><strong>${escapeHtml(n)}</strong><br><small>${Object.keys(projects[n].files||{}).length} Java file(s) • Saved ${new Date(projects[n].savedAt||Date.now()).toLocaleString()}</small></button>`).join("")}</div>`:'<p class="notice">No projects are saved in this browser yet.</p>';
    showModal("Open Project",`<div class="content">${list}<hr><p class="notice">You can also import a project JSON file or a single .java source file.</p><input id="projectFilePicker" type="file" accept=".json,.java,application/json,text/x-java-source"></div>`);
    $$('[data-project]',els.modalBody).forEach(b=>b.onclick=()=>{applyProject(projects[b.dataset.project]);closeModal();log(`Project "${b.dataset.project}" opened.`,"success");});
    $("#projectFilePicker",els.modalBody).onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const text=await file.text();
      if(file.name.toLowerCase().endsWith(".json")){try{applyProject(JSON.parse(text));closeModal();log(`Imported project "${state.projectName}".`,"success");}catch{log("Invalid project JSON file.","error");}return;}
      state.projectName=file.name.replace(/\.java$/i,"")||"ImportedJavaProject";state.currentFile=file.name;state.mainClass=classFromFile(file.name);state.files={[file.name]:text};state.forms={};state.selectedId=null;els.mainClassInput.value=state.mainClass;updateActiveProjectLabel();renderProjectTree();loadCurrentFile({preferDesign:false});switchView("source");setDirty(true);closeModal();log(`Opened ${file.name}.`);
    };
  }

  function switchView(view){const design=view==="design";els.designView.classList.toggle("active",design);els.sourceView.classList.toggle("active",!design);$$(".tab").forEach(t=>{const a=t.dataset.view===view;t.classList.toggle("active",a);t.setAttribute("aria-selected",String(a));});}
  function syncFormFromInputs(){
    const f=currentForm(); if(!f)return;
    const oldClass=f.className; f.className=safeClassName(els.className.value); f.title=els.frameTitle.value||f.className; f.width=Math.max(400,Math.min(1200,Number(els.frameWidth.value)||760)); f.height=Math.max(300,Math.min(800,Number(els.frameHeight.value)||500));
    els.className.value=f.className; els.frameWidth.value=f.width; els.frameHeight.value=f.height;
    if(f.className!==oldClass){ renameCurrentFormFile(f.className); }
  }
  function renameCurrentFormFile(newClass){
    const oldFile=state.currentFile,newFile=`${safeClassName(newClass)}.java`; if(oldFile===newFile)return;
    if(state.files[newFile]!==undefined){const f=currentForm();f.className=classFromFile(oldFile);els.className.value=f.className;log(`${newFile} already exists. Class name was not changed.`,"error");return;}
    const wasMain=classFromFile(oldFile)===state.mainClass; state.forms[newFile]=state.forms[oldFile];delete state.forms[oldFile];state.files[newFile]=state.files[oldFile]||"";delete state.files[oldFile];state.currentFile=newFile;if(wasMain){state.mainClass=safeClassName(newClass);els.mainClassInput.value=state.mainClass;}renderProjectTree();
  }
  function updateFrameVisual(){const f=currentForm();if(!f)return;els.frameTitleDisplay.textContent=f.title||f.className;els.fakeWindow.style.width=`${f.width}px`;els.canvas.style.width=`${f.width}px`;els.canvas.style.height=`${f.height}px`;}
  function updateFrame(){if(!isFormFile())return;syncFormFromInputs();updateFrameVisual();renderProjectTree();setDirty(true);}

  function createComponent(type,x=30,y=30){
    const f=currentForm();if(!f){log("Open a JFrame Form before adding Swing controls.","error");return;}const d=componentDefaults[type];if(!d)return;const n=++f.counter;
    const item={id:`component-${Date.now()}-${n}`,type,name:`${d.prefix}${n}`,text:d.text,x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y)),w:d.w,h:d.h,actionTarget:"",eventCode:null,lastGeneratedEventCode:null};f.components.push(item);state.selectedId=item.id;renderComponents();selectComponent(item.id);setDirty(true);
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
    return '// TODO add your handling code here:';
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
    if(!selected){els.noSelection.classList.remove('hidden');els.componentProps.classList.add('hidden');els.buttonEventsBlock?.classList.add('hidden');return;}
    els.noSelection.classList.add('hidden');els.componentProps.classList.remove('hidden');els.propType.value=selected.type;els.propName.value=selected.name;els.propText.value=selected.text;els.propX.value=selected.x;els.propY.value=selected.y;els.propW.value=selected.w;els.propH.value=selected.h;
    const isButton=selected.type==='JButton';
    els.actionTargetLabel.classList.toggle('hidden',!isButton);
    els.buttonEventsBlock?.classList.toggle('hidden',!isButton);
    if(isButton){
      populateActionTargets(selected);
      if(els.propActionHandler)els.propActionHandler.value=actionHandlerName(selected);
    }
  }
  function componentInnerHtml(item,preview=false){
    const text=escapeHtml(item.text);
    const isAuthButton=item.role==='loginSubmit'||item.role==='registerSubmit';
    const actionAttr=preview&&item.type==='JButton'&&isAuthButton?` data-auth-action="${item.role==='loginSubmit'?'login':'register'}"`:preview&&item.type==='JButton'&&item.actionTarget?` data-open-form="${escapeHtml(item.actionTarget)}"`:'';
    switch(item.type){case'JLabel':return`<label>${text||'Label'}</label>`;case'JTextField':return`<input type="text" value="${text}">`;case'JPasswordField':return`<input type="password" value="${text}">`;case'JButton':return`<button type="button"${actionAttr}>${text||'Button'}</button>`;case'JCheckBox':return`<label><input type="checkbox"> ${text||'Check Box'}</label>`;case'JRadioButton':return`<label><input type="radio"> ${text||'Radio Button'}</label>`;case'JTextArea':return`<textarea>${text}</textarea>`;case'JComboBox':{const o=String(item.text||'Item 1, Item 2').split(',').map(v=>v.trim()).filter(Boolean);return`<select>${o.map(v=>`<option>${escapeHtml(v)}</option>`).join('')}</select>`;}case'JTable':{const c=String(item.text||'Column 1, Column 2').split(',').map(v=>v.trim()).filter(Boolean);return`<table><thead><tr>${c.map(v=>`<th>${escapeHtml(v)}</th>`).join('')}</tr></thead><tbody><tr>${c.map(()=>'<td></td>').join('')}</tr><tr>${c.map(()=>'<td></td>').join('')}</tr></tbody></table>`;}default:return`<div>${text}</div>`;}
  }
  function renderComponents(){
    $$('.component',els.canvas).forEach(n=>n.remove());const f=currentForm();if(!f){els.emptyCanvas.classList.remove('hidden');selectComponent(null);return;}
    f.components.forEach(item=>{const node=document.createElement('div');node.className='component';node.dataset.id=item.id;if(item.type==='JButton')node.dataset.buttonEvent='true';Object.assign(node.style,{left:`${item.x}px`,top:`${item.y}px`,width:`${item.w}px`,height:`${item.h}px`});node.innerHTML=`${componentInnerHtml(item)}<span class="resize" title="Resize"></span>`;
      node.addEventListener('dblclick',e=>{
        if(item.type!=='JButton')return;
        e.preventDefault();e.stopPropagation();selectComponent(item.id);openActionHandler(item);
      });
      node.addEventListener('pointerdown',e=>{if(e.button!==0)return;const resize=e.target.classList.contains('resize');selectComponent(item.id);const sx=e.clientX,sy=e.clientY,start={x:item.x,y:item.y,w:item.w,h:item.h};node.setPointerCapture(e.pointerId);
        const move=m=>{const dx=m.clientX-sx,dy=m.clientY-sy;if(resize){item.w=Math.max(20,Math.round(start.w+dx));item.h=Math.max(18,Math.round(start.h+dy));}else{const maxX=Math.max(0,els.canvas.clientWidth-item.w),maxY=Math.max(0,els.canvas.clientHeight-item.h);item.x=Math.max(0,Math.min(maxX,Math.round(start.x+dx)));item.y=Math.max(0,Math.min(maxY,Math.round(start.y+dy)));}Object.assign(node.style,{left:`${item.x}px`,top:`${item.y}px`,width:`${item.w}px`,height:`${item.h}px`});selectComponent(item.id);setDirty(true);};
        const up=u=>{try{node.releasePointerCapture(u.pointerId);}catch{}node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',up);};node.addEventListener('pointermove',move);node.addEventListener('pointerup',up);});els.canvas.appendChild(node);});
    els.emptyCanvas.classList.toggle('hidden',f.components.length>0);selectComponent(state.selectedId);
  }
  function updateSelectedFromProperties(){const s=getSelected();if(!s)return;s.name=safeVariableName(els.propName.value,s.name);s.text=els.propText.value;s.x=Math.max(0,Number(els.propX.value)||0);s.y=Math.max(0,Number(els.propY.value)||0);s.w=Math.max(20,Number(els.propW.value)||20);s.h=Math.max(18,Number(els.propH.value)||18);if(s.type==='JButton')s.actionTarget=els.propActionTarget.value||'';renderComponents();setDirty(true);}
  function deleteSelected(){const f=currentForm(),s=getSelected();if(!f||!s)return;f.components=f.components.filter(i=>i.id!==s.id);state.selectedId=null;renderComponents();setDirty(true);log(`${s.type} "${s.name}" deleted.`);}

  function javaDeclaration(i){return`    private ${i.type} ${safeVariableName(i.name)};`;}
  function javaInitialization(i){const n=safeVariableName(i.name),t=escapeJava(i.text);switch(i.type){case'JLabel':return`        ${n} = new JLabel("${t}");`;case'JTextField':return`        ${n} = new JTextField("${t}");`;case'JPasswordField':return`        ${n} = new JPasswordField("${t}");`;case'JButton':return`        ${n} = new JButton("${t}");`;case'JCheckBox':return`        ${n} = new JCheckBox("${t}");`;case'JRadioButton':return`        ${n} = new JRadioButton("${t}");`;case'JTextArea':return`        ${n} = new JTextArea("${t}");`;case'JComboBox':{const v=String(i.text||'').split(',').map(x=>`"${escapeJava(x.trim())}"`).filter(x=>x!=='""').join(', ');return`        ${n} = new JComboBox<>(new String[]{${v}});`;}case'JTable':{const v=String(i.text||'Column 1, Column 2').split(',').map(x=>`"${escapeJava(x.trim())}"`).filter(x=>x!=='""').join(', ');return`        ${n} = new JTable(new Object[][]{}, new String[]{${v}});`;}default:return`        ${n} = new ${i.type}();`;}}
  function javaAddStatement(i){
    const n=safeVariableName(i.name);const lines=[];
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
    const f=form||currentForm()||blankForm();const c=safeClassName(f.className),title=escapeJava(f.title||c),w=Math.max(400,Number(f.width)||760),h=Math.max(300,Number(f.height)||500),components=Array.isArray(f.components)?f.components:[];
    const dec=components.map(javaDeclaration).join('\n'),init=components.map(javaInitialization).join('\n'),adds=components.map(javaAddStatement).join('\n\n');
    const handlers=javaEventHandlers(f);
    const authType=f.templateType==='login-db'||f.templateType==='register-db';
    const extraMethods=f.templateType==='login-db'?loginMethods(f):f.templateType==='register-db'?registerMethods(f):'';
    const imports=authType?'import javax.swing.*;\nimport java.sql.*;':'import javax.swing.*;';

    return`${imports}\n\npublic class ${c} extends JFrame {\n${dec?'\n'+dec+'\n':''}\n    public ${c}() {\n        setTitle("${title}");\n        setSize(${w}, ${h});\n        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);\n        setLocationRelativeTo(null);\n        setLayout(null);\n\n${init||'        // Add Swing components from the Design tab.'}${adds?'\n\n'+adds:''}\n    }\n\n${handlers}${handlers?'\n':''}${extraMethods}\n    public static void main(String[] args) {\n        SwingUtilities.invokeLater(() -> new ${c}().setVisible(true));\n    }\n}\n`;
  }

  function generateCurrentForm(switchToSource=true){
    if(!isFormFile()){log('The current file is not a JFrame Form.','error');return;}
    syncFormFromInputs();upgradeAuthMetadata();autoLinkAuthForms();const f=currentForm();
    const existingSource=els.codeEditor.value||state.files[state.currentFile]||'';
    captureEditedEventBodies(f,existingSource);
    if(f.templateType==='login-db'||f.templateType==='register-db')ensureAuthSupportFiles(false);
    state.files[state.currentFile]=generateJavaCode(f);els.codeEditor.value=state.files[state.currentFile];els.currentFileLabel.textContent=state.currentFile;
    if(state.foldView) renderFoldedCode();
    if(switchToSource)switchView('source');setDirty(true);log(`Generated ${state.currentFile} from its Design canvas.`,"success");
  }

  function openActionHandler(item=getSelected()){
    if(!item || item.type!=='JButton'){log('Select a JButton to open its ActionPerformed event.','error');return;}
    if(!isFormFile()){log('Open a JFrame Form first.','error');return;}
    state.selectedId=item.id;
    generateCurrentForm(false);
    const handler=actionHandlerName(item);
    const source=els.codeEditor.value;
    const idx=source.indexOf(`void ${handler}(`);
    setFoldView(false);
    switchView('source');
    if(idx>=0){
      const nameStart=source.indexOf(handler,idx);
      const nameEnd=nameStart+handler.length;
      els.codeEditor.focus();
      els.codeEditor.setSelectionRange(nameStart,nameEnd);
      const line=source.slice(0,nameStart).split('\n').length-1;
      const style=getComputedStyle(els.codeEditor);
      const lineHeight=parseFloat(style.lineHeight)||21.7;
      els.codeEditor.scrollTop=Math.max(0,line*lineHeight-120);
      els.codeEditor.classList.remove('source-jump-flash');
      void els.codeEditor.offsetWidth;
      els.codeEditor.classList.add('source-jump-flash');
      log(`Opened event handler ${handler}(...).`,'success');
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
      loadCurrentFile({preferDesign:isFormFile()});
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
    showModal(`JFrame Preview - ${f.className}`,`<div class="preview-box"><div style="width:${f.width}px;max-width:none;margin:auto"><div class="fake-title"><span>${escapeHtml(f.title)}</span><span>— □ ×</span></div><div class="preview-frame" style="width:${f.width}px;height:${f.height}px">${f.components.map(i=>`<div class="preview-component" style="left:${i.x}px;top:${i.y}px;width:${i.w}px;height:${i.h}px">${componentInnerHtml(i,true)}</div>`).join('')}</div></div></div>`);
    $$('[data-open-form]',els.modalBody).forEach(b=>b.addEventListener('click',()=>{const target=b.dataset.openForm;closeModal();previewFormByClass(target);}));
    $$('[data-auth-action]',els.modalBody).forEach(b=>b.addEventListener('click',()=>{log(`Preview only: ${b.dataset.authAction} uses JDBC in the generated Java application. Open the Source tab to see the database code.`,"info");}));
  }
  function runProject(){if(!state.projectName){log('Create or open a project first.','error');return;}const ok=compileCheck();if(!ok)return;const file=`${state.mainClass}.java`;if(state.forms[file]){showPreview(file);log(`Running visual preview from main form ${state.mainClass}.`,"success");}else{log(`Main class ${state.mainClass} is source-only. A real JDK/JVM is required to execute it.`);}}

  async function copySource(){try{await navigator.clipboard.writeText(els.codeEditor.value);log('Source code copied.',"success");}catch{els.codeEditor.focus();els.codeEditor.select();document.execCommand('copy');log('Source code copied.',"success");}}
  async function testDatabase(){const payload={host:els.dbHost.value.trim()||'localhost',port:els.dbPort.value.trim()||'3306',database:els.dbName.value.trim(),user:els.dbUser.value,password:els.dbPass.value,usersTable:usersTable()};if(!payload.database){log('Enter a database name first.','error');return;}log(`Testing MySQL connection to ${payload.host}:${payload.port}/${payload.database}...`);try{const response=await fetch('api/test-db.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{throw new Error('The PHP endpoint did not return JSON.');}if(!response.ok||!data.ok)throw new Error(data.message||'Database connection failed.');log(data.message||'Database connection successful.',"success");}catch(e){log(`Database test failed: ${e.message}\nIf you are using Live Server on port 5500, PHP will NOT execute. Open this project through XAMPP Apache (for example http://localhost/your-folder/IDE/) to use test-db.php.`,"error");}}
  function refreshFiles(){if(isFormFile())generateCurrentForm(false);else syncEditor();renderProjectTree();populateActionTargets();log('Project file list refreshed.');}
  function showHelp(){showModal('IDE Help',`<div class="content"><p><strong>Multi-form project:</strong> use <em>+ New File / JFrame</em> to create LoginForm, RegisterForm, the Professional Dashboard JFrame template, StudentForm, and other windows.</p><p><strong>Each JFrame Form</strong> has a separate Design canvas and separate generated Java source.</p><p><strong>Button navigation:</strong> select a JButton and use <em>Open JFrame on Button Click</em> to connect one form to another.</p><p><strong>Main form:</strong> select a file and click <em>Set as Main</em>.</p><p><strong>Database:</strong> choose the Login or Register MySQL template. The IDE generates DBConnection.java, PasswordUtil.java, and database_setup.sql. Import MySQL Connector/J into the real NetBeans project.</p><p><strong>Delete files:</strong> click the × beside any file in the project tree or select a file and use Delete Selected File.</p><p><strong>Code folding:</strong> use <em>Minimize Generated</em> to collapse imports, fields, constructor/init code, and main. Use <em>Maximize All</em> to expand every section. Click <em>Edit</em> on a folded section to jump back to the full editable source.</p><p class="notice">Real Swing execution still requires Java/JDK. The browser Run button provides an interactive form preview, including navigation between designed JFrame forms.</p></div>`);}

  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchView(t.dataset.view)));
  $$('.palette button').forEach(b=>{b.addEventListener('click',()=>{const f=currentForm();const i=f?.components.length||0;createComponent(b.dataset.type,30+(i%6)*18,30+(i%6)*18);});b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',b.dataset.type);e.dataTransfer.effectAllowed='copy';});});
  els.canvas.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});
  els.canvas.addEventListener('drop',e=>{e.preventDefault();const type=e.dataTransfer.getData('text/plain');if(!componentDefaults[type])return;const r=els.canvas.getBoundingClientRect();createComponent(type,e.clientX-r.left,e.clientY-r.top);});
  els.canvas.addEventListener('pointerdown',e=>{if(e.target===els.canvas){state.selectedId=null;selectComponent(null);}});
  [els.className,els.frameTitle,els.frameWidth,els.frameHeight].forEach(i=>{i.addEventListener('change',updateFrame);i.addEventListener('input',()=>{if(i===els.frameTitle&&currentForm()){currentForm().title=i.value||currentForm().className;els.frameTitleDisplay.textContent=currentForm().title;}setDirty(true);});});
  [els.propName,els.propText,els.propX,els.propY,els.propW,els.propH,els.propActionTarget].forEach(i=>{i.addEventListener('change',updateSelectedFromProperties);if(i===els.propText)i.addEventListener('input',()=>{const s=getSelected();if(s){s.text=i.value;renderComponents();setDirty(true);}});});
  els.newProjectBtn.onclick=showNewProjectDialog;els.openProjectBtn.onclick=showOpenProjectDialog;els.saveBtn.onclick=saveProject;els.newFileBtn.onclick=showNewFileDialog;els.treeNewFileBtn.onclick=showNewFileDialog;els.deleteFileBtn.onclick=deleteCurrentFile;els.setMainBtn.onclick=setCurrentAsMain;els.compileBtn.onclick=compileCheck;els.runBtn.onclick=runProject;els.previewBtn.onclick=()=>showPreview();els.addDbBtn.onclick=addDbConnectionFile;els.addAuthBtn.onclick=()=>ensureAuthSupportFiles(true);els.refreshFilesBtn.onclick=refreshFiles;els.foldModeBtn.onclick=toggleFoldView;els.collapseGeneratedBtn.onclick=collapseGeneratedCode;els.expandAllCodeBtn.onclick=expandAllCode;els.generateBtn.onclick=()=>generateCurrentForm(true);els.copyBtn.onclick=copySource;els.openEventHandlerBtn.onclick=()=>openActionHandler();els.deleteComponentBtn.onclick=deleteSelected;els.generateAuthBtn.onclick=()=>ensureAuthSupportFiles(true);els.testDbBtn.onclick=testDatabase;els.clearOutputBtn.onclick=()=>replaceOutput('Output cleared.');
  els.codeEditor.addEventListener('input',()=>{if(state.projectName&&state.currentFile){state.files[state.currentFile]=els.codeEditor.value;setDirty(true);}});
  els.mainClassInput.addEventListener('change',()=>{state.mainClass=safeClassName(els.mainClassInput.value);els.mainClassInput.value=state.mainClass;renderProjectTree();setDirty(true);});
  els.modalClose.onclick=closeModal;els.modal.addEventListener('click',e=>{if(e.target===els.modal)closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!els.modal.classList.contains('hidden'))closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject();}});
  $$('.menubar button').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.menu;if(m==='file')showNewFileDialog();else if(m==='source')isFormFile()?generateCurrentForm(true):switchView('source');else if(m==='run')runProject();else if(m==='database')addDbConnectionFile();else if(m==='help')showHelp();else if(m==='view')switchView('design');else log(`${b.textContent} menu selected.`);}));

  migrateOldProjects(); const saved=getProjects(),names=Object.keys(saved); if(names.length){const newest=names.sort((a,b)=>new Date(saved[b].savedAt||0)-new Date(saved[a].savedAt||0))[0];applyProject(saved[newest]);replaceOutput(`Restored saved project "${newest}".\nYou can now add more JFrame forms with + New File / JFrame.`);}else{newProject('JavaJFrameProject');setDirty(false);}
})();
