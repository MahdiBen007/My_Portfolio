DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@local.test';
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      reauthentication_token,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'admin@local.test',
      crypt('123456', gen_salt('bf')),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin"}',
      now(),
      now()
    );

    INSERT INTO auth.identities (
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      'admin@local.test',
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@local.test'),
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
      SET encrypted_password = crypt('123456', gen_salt('bf')),
          confirmation_token = COALESCE(confirmation_token, ''),
          recovery_token = COALESCE(recovery_token, ''),
          email_change_token_new = COALESCE(email_change_token_new, ''),
          email_change = COALESCE(email_change, ''),
          email_change_token_current = COALESCE(email_change_token_current, ''),
          phone = COALESCE(phone, ''),
          phone_change = COALESCE(phone_change, ''),
          phone_change_token = COALESCE(phone_change_token, ''),
          reauthentication_token = COALESCE(reauthentication_token, ''),
          email_confirmed_at = now(),
          updated_at = now()
      WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (v_user_id, 'admin@local.test', 'Admin', 'admin')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'admin', email = EXCLUDED.email, full_name = EXCLUDED.full_name;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.services) THEN
    INSERT INTO public.services (
      title,
      title_ar,
      description,
      description_ar,
      icon,
      tags,
      cta_label,
      cta_link,
      sort_order,
      visible
    ) VALUES
      (
        'Frontend Development',
        'تطوير الواجهات الأمامية',
        'Modern responsive interfaces using React and Tailwind.',
        'واجهات حديثة ومتجاوبة باستخدام React وTailwind.',
        'Code',
        ARRAY['React', 'UI'],
        'View Projects',
        '#portfolio',
        0,
        true
      ),
      (
        'Backend Development',
        'تطوير الخوادم',
        'Secure APIs and scalable services.',
        'واجهات برمجية آمنة وقابلة للتوسع.',
        'Server',
        ARRAY['API', 'Node.js'],
        NULL,
        NULL,
        1,
        true
      ),
      (
        'Database Design',
        'تصميم قواعد البيانات',
        'Schema design, optimization, and reporting.',
        'تصميم قواعد البيانات وتحسين الأداء والتقارير.',
        'Database',
        ARRAY['Postgres', 'SQL'],
        NULL,
        NULL,
        2,
        true
      ),
      (
        'UI/UX Design',
        'تصميم تجربة المستخدم',
        'User-centered interfaces and design systems.',
        'واجهات وتجارب مستخدم عملية وجذابة.',
        'Palette',
        ARRAY['UX', 'Figma'],
        NULL,
        NULL,
        3,
        true
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.skills) THEN
    INSERT INTO public.skills (
      name,
      name_ar,
      icon,
      category,
      level,
      brand_color,
      sort_order,
      visible
    ) VALUES
      ('HTML5', 'HTML5', 'html', 'frontend', 90, NULL, 0, true),
      ('CSS3', 'CSS3', 'css', 'frontend', 90, NULL, 1, true),
      ('Tailwind CSS', 'Tailwind CSS', 'tailwind', 'frontend', 88, NULL, 2, true),
      ('JavaScript', 'جافاسكربت', 'javascript', 'frontend', 92, NULL, 3, true),
      ('TypeScript', 'تايب سكربت', 'typescript', 'frontend', 86, NULL, 4, true),
      ('React', 'ريأكت', 'react', 'frontend', 90, NULL, 5, true),
      ('Node.js', 'نود جي اس', 'nodejs', 'backend', 84, NULL, 6, true),
      ('PostgreSQL', 'بوستجري إس كيو إل', 'postgresql', 'database', 82, NULL, 7, true),
      ('Supabase', 'سوبابيز', 'database', 'tools', 78, NULL, 8, true),
      ('Docker', 'دوكر', 'docker', 'tools', 72, NULL, 9, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.projects) THEN
    INSERT INTO public.projects (
      title,
      title_ar,
      description,
      description_ar,
      thumbnail_url,
      gallery_images,
      tech_stack,
      github_link,
      live_demo_link,
      category,
      status,
      featured,
      sort_order,
      visible
    ) VALUES
      (
        'E-commerce Platform',
        'منصة تجارة إلكترونية',
        'Full-featured online store with secure payments and inventory tools.',
        'متجر إلكتروني متكامل مع بوابة دفع آمنة وإدارة مخزون.',
        NULL,
        ARRAY['/project-placeholder.jpg'],
        ARRAY['React', 'Node.js', 'PostgreSQL'],
        'https://github.com/example/ecommerce',
        'https://example.com',
        'E-commerce',
        'completed',
        true,
        0,
        true
      ),
      (
        'Analytics Dashboard',
        'لوحة تحكم تحليلية',
        'Interactive dashboard with real-time insights and reports.',
        'لوحة تحكم تفاعلية لعرض التحليلات والتقارير.',
        NULL,
        ARRAY['/project-placeholder.jpg'],
        ARRAY['React', 'TypeScript', 'D3.js'],
        'https://github.com/example/analytics',
        'https://example.com',
        'Dashboard',
        'completed',
        false,
        1,
        true
      ),
      (
        'Startup Landing Page',
        'صفحة هبوط لشركة ناشئة',
        'High-converting landing page optimized for performance.',
        'صفحة هبوط حديثة محسّنة للأداء والتحويلات.',
        NULL,
        ARRAY['/project-placeholder.jpg'],
        ARRAY['Vite', 'Tailwind CSS'],
        'https://github.com/example/landing',
        'https://example.com',
        'Landing Page',
        'completed',
        false,
        2,
        true
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.timeline) THEN
    INSERT INTO public.timeline (
      year,
      title,
      title_ar,
      description,
      description_ar,
      icon,
      sort_order,
      visible
    ) VALUES
      (
        '2024 - Present',
        'Senior Web Developer',
        'مطور ويب أول',
        'Leading web projects and mentoring developers.',
        'قيادة مشاريع الويب وتوجيه الفريق.',
        'Briefcase',
        0,
        true
      ),
      (
        '2022 - 2024',
        'Full Stack Developer',
        'مطور فل ستاك',
        'Built full-stack applications for clients.',
        'بناء تطبيقات متكاملة للعملاء.',
        'Code',
        1,
        true
      ),
      (
        '2020 - 2022',
        'Frontend Developer',
        'مطور واجهات أمامية',
        'Focused on UI performance and accessibility.',
        'التركيز على أداء الواجهات وتجربة المستخدم.',
        'Monitor',
        2,
        true
      );
  END IF;

  UPDATE public.about
  SET bio = 'Web developer focused on building modern, high-performance apps with great UX.',
      bio_ar = 'مطور ويب متخصص في بناء تطبيقات حديثة بأداء عال وتجربة مستخدم ممتازة.',
      profile_image_url = '/hero-portrait.png',
      resume_url = '/cv.pdf'
  WHERE id = (SELECT id FROM public.about ORDER BY created_at ASC LIMIT 1);

  IF NOT FOUND THEN
    INSERT INTO public.about (
      bio,
      bio_ar,
      profile_image_url,
      resume_url
    ) VALUES (
      'Web developer focused on building modern, high-performance apps with great UX.',
      'مطور ويب متخصص في بناء تطبيقات حديثة بأداء عال وتجربة مستخدم ممتازة.',
      '/hero-portrait.png',
      '/cv.pdf'
    );
  END IF;

  UPDATE public.settings
  SET primary_color = '#4F46E5',
      secondary_color = '#22C55E',
      meta_title = 'Portfolio',
      admin_meta_title = 'Admin Dashboard',
      meta_description = 'Professional portfolio showcasing modern web projects.',
      keywords = 'portfolio, developer, web, frontend, backend',
      github_url = 'https://github.com/your-profile',
      linkedin_url = 'https://linkedin.com/in/your-profile',
      behance_url = 'https://behance.net/your-profile',
      email = 'admin@local.test',
      whatsapp = 'https://wa.me/201234567890',
      footer_contact_info = 'Available for freelance projects and collaborations.',
      copyright_text = '© 2026 All rights reserved.',
      locale = 'ar'
  WHERE id = (SELECT id FROM public.settings ORDER BY created_at ASC LIMIT 1);

  IF NOT FOUND THEN
    INSERT INTO public.settings (
      primary_color,
      secondary_color,
      meta_title,
      admin_meta_title,
      meta_description,
      keywords,
      github_url,
      linkedin_url,
      behance_url,
      email,
      whatsapp,
      footer_contact_info,
      copyright_text,
      locale
    ) VALUES (
      '#4F46E5',
      '#22C55E',
      'Portfolio',
      'Admin Dashboard',
      'Professional portfolio showcasing modern web projects.',
      'portfolio, developer, web, frontend, backend',
      'https://github.com/your-profile',
      'https://linkedin.com/in/your-profile',
      'https://behance.net/your-profile',
      'admin@local.test',
      'https://wa.me/201234567890',
      'Available for freelance projects and collaborations.',
      '© 2026 All rights reserved.',
      'ar'
    );
  END IF;
END $$;
