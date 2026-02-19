import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEACHER_ID = 'fe859ca3-5412-4676-814c-3a88c9dec0d8';
const DEFAULT_PASSWORD = 'Teste123!';

// Dados dos responsáveis
const parents = [
  { name: 'Giovanella', email: 'giovanella@teste.com', children: ['maria.ferraz@teste.com', 'felipe.ferraz@teste.com', 'antonio@teste.com'] },
  { name: 'Daniela Risola', email: 'daniela@teste.com', children: ['pedro.risola@teste.com', 'carol@teste.com'] },
  { name: 'Maysa', email: 'maysa@teste.com', children: ['lourenco@teste.com'] },
  { name: 'Karin', email: 'karin@teste.com', children: ['guilherme@teste.com', 'pedro.karin@teste.com'] },
  { name: 'Milene Telezzi', email: 'milene@teste.com', children: ['otavio@teste.com', 'heloisa@teste.com'] },
  { name: 'Aline', email: 'aline@teste.com', children: ['bruno@teste.com'] },
];

// Dados dos alunos
const students = [
  { name: 'Maria Ferraz', email: 'maria.ferraz@teste.com', grade: '9º Ano EF', age: 14, school: 'CLQ' },
  { name: 'Felipe Ferraz', email: 'felipe.ferraz@teste.com', grade: '2º EM', age: 17, school: 'CLQ' },
  { name: 'Antônio Ferraz', email: 'antonio@teste.com', grade: '6º Ano EF', age: 11, school: 'CLQ' },
  { name: 'Pedro Risola', email: 'pedro.risola@teste.com', grade: '8º Ano EF', age: 13, school: 'CLQ' },
  { name: 'Carolina Risola', email: 'carol@teste.com', grade: '5º Ano EF', age: 10, school: 'CLQ' },
  { name: 'Lourenço', email: 'lourenco@teste.com', grade: '8º Ano EF', age: 13, school: 'Atlântico' },
  { name: 'Guilherme', email: 'guilherme@teste.com', grade: '8º Ano EF', age: 13, school: 'CLQ' },
  { name: 'Pedro Henrique', email: 'pedro.karin@teste.com', grade: '8º Ano EF', age: 13, school: 'CLQ' },
  { name: 'Otávio', email: 'otavio@teste.com', grade: '2º EM', age: 17, school: 'Liceu' },
  { name: 'Heloísa', email: 'heloisa@teste.com', grade: '2º EM', age: 17, school: 'Liceu' },
  { name: 'Bruno', email: 'bruno@teste.com', grade: '7º Ano EF', age: 12, school: 'CLQ' },
  { name: 'Benjamim', email: 'benjamim@teste.com', grade: '6º Ano EF', age: 11, school: 'Atlântico' },
];

// Histórico de aulas de Novembro 2025 (extraído dos PDFs)
const learningHistory = [
  // Maria e Fê - Novembro
  { student: 'maria.ferraz@teste.com', date: '2025-11-03', duration: 90, topics: ['Equações do 1º grau', 'Revisão prova'] },
  { student: 'maria.ferraz@teste.com', date: '2025-11-10', duration: 90, topics: ['Geometria', 'Área e perímetro'] },
  { student: 'maria.ferraz@teste.com', date: '2025-11-17', duration: 90, topics: ['Sistemas de equações'] },
  { student: 'maria.ferraz@teste.com', date: '2025-11-24', duration: 90, topics: ['Proporcionalidade'] },
  { student: 'felipe.ferraz@teste.com', date: '2025-11-03', duration: 90, topics: ['Logaritmos', 'Função exponencial'] },
  { student: 'felipe.ferraz@teste.com', date: '2025-11-10', duration: 90, topics: ['Progressões aritméticas'] },
  { student: 'felipe.ferraz@teste.com', date: '2025-11-17', duration: 90, topics: ['Progressões geométricas'] },
  { student: 'felipe.ferraz@teste.com', date: '2025-11-24', duration: 90, topics: ['Matemática financeira'] },
  
  // Pedro - Novembro
  { student: 'pedro.risola@teste.com', date: '2025-11-04', duration: 60, topics: ['Frações', 'Operações'] },
  { student: 'pedro.risola@teste.com', date: '2025-11-11', duration: 60, topics: ['Equações'] },
  { student: 'pedro.risola@teste.com', date: '2025-11-18', duration: 60, topics: ['Geometria básica'] },
  { student: 'pedro.risola@teste.com', date: '2025-11-25', duration: 60, topics: ['Revisão geral'] },
  
  // Benjamim - Novembro
  { student: 'benjamim@teste.com', date: '2025-11-05', duration: 60, topics: ['Números inteiros', 'Operações'] },
  { student: 'benjamim@teste.com', date: '2025-11-12', duration: 60, topics: ['Frações equivalentes'] },
  { student: 'benjamim@teste.com', date: '2025-11-19', duration: 60, topics: ['Decimais'] },
  { student: 'benjamim@teste.com', date: '2025-11-26', duration: 60, topics: ['Porcentagem básica'] },
  
  // Gui e Pedrão - Novembro
  { student: 'guilherme@teste.com', date: '2025-11-06', duration: 120, topics: ['Equações do 1º grau', 'Sistemas'] },
  { student: 'guilherme@teste.com', date: '2025-11-13', duration: 120, topics: ['Geometria plana'] },
  { student: 'guilherme@teste.com', date: '2025-11-20', duration: 120, topics: ['Teorema de Tales'] },
  { student: 'guilherme@teste.com', date: '2025-11-27', duration: 120, topics: ['Semelhança de triângulos'] },
  { student: 'pedro.karin@teste.com', date: '2025-11-06', duration: 120, topics: ['Equações do 1º grau', 'Sistemas'] },
  { student: 'pedro.karin@teste.com', date: '2025-11-13', duration: 120, topics: ['Geometria plana'] },
  { student: 'pedro.karin@teste.com', date: '2025-11-20', duration: 120, topics: ['Teorema de Tales'] },
  { student: 'pedro.karin@teste.com', date: '2025-11-27', duration: 120, topics: ['Semelhança de triângulos'] },
  
  // Lourenço - Novembro
  { student: 'lourenco@teste.com', date: '2025-11-07', duration: 60, topics: ['Álgebra básica'] },
  { student: 'lourenco@teste.com', date: '2025-11-14', duration: 60, topics: ['Expressões algébricas'] },
  { student: 'lourenco@teste.com', date: '2025-11-21', duration: 60, topics: ['Fatoração'] },
  { student: 'lourenco@teste.com', date: '2025-11-28', duration: 60, topics: ['Produtos notáveis'] },
  
  // Otávio e Heloísa - Novembro
  { student: 'otavio@teste.com', date: '2025-11-08', duration: 90, topics: ['Trigonometria', 'Funções trigonométricas'] },
  { student: 'otavio@teste.com', date: '2025-11-15', duration: 90, topics: ['Matrizes'] },
  { student: 'otavio@teste.com', date: '2025-11-22', duration: 90, topics: ['Determinantes'] },
  { student: 'otavio@teste.com', date: '2025-11-29', duration: 90, topics: ['Sistemas lineares'] },
  { student: 'heloisa@teste.com', date: '2025-11-08', duration: 90, topics: ['Trigonometria', 'Funções trigonométricas'] },
  { student: 'heloisa@teste.com', date: '2025-11-15', duration: 90, topics: ['Matrizes'] },
  { student: 'heloisa@teste.com', date: '2025-11-22', duration: 90, topics: ['Determinantes'] },
  { student: 'heloisa@teste.com', date: '2025-11-29', duration: 90, topics: ['Sistemas lineares'] },
];

// Preços por duração
const prices = {
  60: 100,
  90: 140,
  120: 180,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const logs: string[] = [];
    const userIdMap: Record<string, string> = {};
    const schoolIdMap: Record<string, string> = {};

    // 1. Limpar dados fictícios
    logs.push('🧹 Limpando dados fictícios...');
    await supabaseAdmin.from('learning_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('financial_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('teacher_student_relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('family_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('parent_student_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    logs.push('✅ Dados antigos limpos');

    // 2. Criar escolas reais
    logs.push('🏫 Criando escolas...');
    const schools = [
      { name: 'CLQ', city: 'Campinas', state: 'SP' },
      { name: 'Atlântico', city: 'Campinas', state: 'SP' },
      { name: 'Liceu', city: 'Campinas', state: 'SP' },
    ];
    
    // Deletar escolas existentes
    await supabaseAdmin.from('schools').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    for (const school of schools) {
      const { data, error } = await supabaseAdmin.from('schools').insert(school).select().single();
      if (error) {
        logs.push(`❌ Erro ao criar escola ${school.name}: ${error.message}`);
      } else {
        schoolIdMap[school.name] = data.id;
        logs.push(`✅ Escola ${school.name} criada`);
      }
    }

    // 3. Criar matéria Matemática
    logs.push('📚 Criando matéria Matemática...');
    await supabaseAdmin.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data: subjectData, error: subjectError } = await supabaseAdmin
      .from('subjects')
      .insert({ name: 'Matemática', color: '#3B82F6', icon: 'calculator' })
      .select()
      .single();
    
    const mathSubjectId = subjectData?.id;
    if (subjectError) {
      logs.push(`❌ Erro ao criar matéria: ${subjectError.message}`);
    } else {
      logs.push('✅ Matéria Matemática criada');
    }

    // 4. Criar usuários responsáveis
    logs.push('👨‍👩‍👧‍👦 Criando responsáveis...');
    for (const parent of parents) {
      try {
        // Verificar se usuário já existe
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === parent.email);
        
        let userId: string;
        
        if (existingUser) {
          userId = existingUser.id;
          logs.push(`⚠️ Responsável ${parent.name} já existe, usando ID existente`);
        } else {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: parent.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: parent.name }
          });
          
          if (userError) {
            logs.push(`❌ Erro ao criar usuário ${parent.name}: ${userError.message}`);
            continue;
          }
          userId = userData.user.id;
          logs.push(`✅ Responsável ${parent.name} criado`);
        }
        
        userIdMap[parent.email] = userId;
        
        // Atualizar perfil
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: parent.name,
          email: parent.email,
          onboarding_completed: true
        });
        
        // Criar role de parent
        await supabaseAdmin.from('user_roles').upsert({
          user_id: userId,
          role: 'parent'
        }, { onConflict: 'user_id,role' });
        
      } catch (err) {
        logs.push(`❌ Erro inesperado ao criar ${parent.name}: ${err}`);
      }
    }

    // 5. Criar usuários alunos
    logs.push('👨‍🎓 Criando alunos...');
    for (const student of students) {
      try {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === student.email);
        
        let userId: string;
        
        if (existingUser) {
          userId = existingUser.id;
          logs.push(`⚠️ Aluno ${student.name} já existe, usando ID existente`);
        } else {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: student.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: student.name }
          });
          
          if (userError) {
            logs.push(`❌ Erro ao criar aluno ${student.name}: ${userError.message}`);
            continue;
          }
          userId = userData.user.id;
          logs.push(`✅ Aluno ${student.name} criado`);
        }
        
        userIdMap[student.email] = userId;
        
        // Atualizar perfil
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: student.name,
          email: student.email,
          grade_year: student.grade,
          age: student.age,
          school_id: schoolIdMap[student.school],
          onboarding_completed: true
        });
        
        // Criar role de student
        await supabaseAdmin.from('user_roles').upsert({
          user_id: userId,
          role: 'student'
        }, { onConflict: 'user_id,role' });
        
      } catch (err) {
        logs.push(`❌ Erro inesperado ao criar aluno ${student.name}: ${err}`);
      }
    }

    // 6. Criar famílias e vínculos
    logs.push('👨‍👩‍👧 Criando famílias e vínculos...');
    for (const parent of parents) {
      const parentId = userIdMap[parent.email];
      if (!parentId) continue;
      
      // Criar família
      const familyCode = parent.name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      const { data: familyData, error: familyError } = await supabaseAdmin
        .from('families')
        .insert({ code: familyCode })
        .select()
        .single();
      
      if (familyError) {
        logs.push(`❌ Erro ao criar família de ${parent.name}: ${familyError.message}`);
        continue;
      }
      
      // Adicionar pai como membro
      await supabaseAdmin.from('family_members').insert({
        family_id: familyData.id,
        profile_id: parentId,
        member_role: 'parent'
      });
      
      // Adicionar filhos como membros e criar links
      for (const childEmail of parent.children) {
        const childId = userIdMap[childEmail];
        if (!childId) continue;
        
        // Membro da família
        await supabaseAdmin.from('family_members').insert({
          family_id: familyData.id,
          profile_id: childId,
          member_role: 'student'
        });
        
        // Link pai-filho
        await supabaseAdmin.from('parent_student_links').insert({
          parent_id: parentId,
          student_id: childId
        });
        
        logs.push(`✅ Vínculo criado: ${parent.name} → ${childEmail}`);
      }
    }

    // 7. Criar relacionamentos teacher-student
    logs.push('🎓 Criando relacionamentos professor-aluno...');
    for (const student of students) {
      const studentId = userIdMap[student.email];
      if (!studentId) continue;
      
      // Encontrar o parent deste aluno
      const parentEmail = parents.find(p => p.children.includes(student.email))?.email;
      const parentId = parentEmail ? userIdMap[parentEmail] : null;
      
      const { error } = await supabaseAdmin.from('teacher_student_relationships').insert({
        teacher_id: TEACHER_ID,
        student_id: studentId,
        parent_id: parentId,
        status: 'active',
        mode: 'presencial',
        price_per_hour: 100,
        price_per_90min: 140,
        price_per_2h: 180
      });
      
      if (error) {
        logs.push(`❌ Erro ao criar relacionamento com ${student.name}: ${error.message}`);
      } else {
        logs.push(`✅ Relacionamento criado: Professor ↔ ${student.name}`);
      }
    }

    // 8. Inserir histórico de aulas
    logs.push('📖 Inserindo histórico de aulas...');
    for (const entry of learningHistory) {
      const studentId = userIdMap[entry.student];
      if (!studentId) continue;
      
      const { error } = await supabaseAdmin.from('learning_history').insert({
        teacher_id: TEACHER_ID,
        student_id: studentId,
        subject_id: mathSubjectId,
        date: entry.date,
        duration_minutes: entry.duration,
        topics_covered: entry.topics,
        observations: 'Aula concluída com sucesso',
        student_performance: 'bom'
      });
      
      if (error) {
        logs.push(`❌ Erro ao inserir aula: ${error.message}`);
      }
    }
    logs.push(`✅ ${learningHistory.length} aulas inseridas`);

    // 9. Inserir transações financeiras (Novembro)
    logs.push('💰 Inserindo transações financeiras...');
    for (const entry of learningHistory) {
      const studentId = userIdMap[entry.student];
      if (!studentId) continue;
      
      const parentEmail = parents.find(p => p.children.includes(entry.student))?.email;
      const parentId = parentEmail ? userIdMap[parentEmail] : null;
      
      const amount = prices[entry.duration as keyof typeof prices] || 100;
      
      await supabaseAdmin.from('financial_transactions').insert({
        teacher_id: TEACHER_ID,
        student_id: studentId,
        parent_id: parentId,
        type: 'class_fee',
        amount: amount,
        status: 'pending',
        description: `Aula de Matemática - ${entry.duration}min`,
        reference_month: '2025-11-01',
        due_date: '2025-12-05'
      });
    }
    logs.push(`✅ Transações financeiras criadas`);

    // 10. Configurar dados PIX do professor
    logs.push('📱 Configurando PIX do professor...');
    await supabaseAdmin.from('teacher_payment_info').upsert({
      teacher_id: TEACHER_ID,
      pix_key: '19993843839',
      pix_key_type: 'phone',
      holder_name: 'Caio Augusto Oliveira Silva',
      bank_name: 'Nubank'
    }, { onConflict: 'teacher_id' });
    logs.push('✅ PIX configurado');

    // Resumo final
    const summary = {
      schools_created: schools.length,
      parents_created: parents.length,
      students_created: students.length,
      classes_recorded: learningHistory.length,
      transactions_created: learningHistory.length
    };

    logs.push('🎉 Seed completo!');
    logs.push(`📊 Resumo: ${JSON.stringify(summary)}`);

    return new Response(JSON.stringify({ 
      success: true, 
      logs,
      summary,
      credentials: {
        password: DEFAULT_PASSWORD,
        parents: parents.map(p => ({ name: p.name, email: p.email })),
        students: students.map(s => ({ name: s.name, email: s.email }))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
