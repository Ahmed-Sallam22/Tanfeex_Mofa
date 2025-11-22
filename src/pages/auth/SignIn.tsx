import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useLoginMutation } from "../../api/auth.api";
import { useAppDispatch } from "../../features/auth/hooks";
import { setCredentials } from "../../features/auth/authSlice";
import {
  Button,
  Input,
  PasswordInput,
  Checkbox,
  FormField,
} from "../../components/ui";
// import Animation from "../../assets/Animation.png";
import bgDesigne from "../../assets/bgDesigne.jpg";
import Logo from "../../assets/Tanfeezletter.png";
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        username: data.username,
        password: data.password,
      }).unwrap();

      dispatch(setCredentials(result));
      toast.success(result.message || "Sign in successful!");

      // Get redirect locations in order of priority
      const storedRedirect = localStorage.getItem("postLoginRedirect");
      console.log(storedRedirect);

      // If there's a stored redirect from logout, prioritize it over fromState
      let target;
      if (storedRedirect) {
        target = storedRedirect;
        localStorage.removeItem("postLoginRedirect");
      } else {
        // Default to app for fresh navigation
        target = "/app";
      }

      navigate(target, { replace: true });
    } catch (error) {
      // Error is already handled by RTK Query and shown via toast
      console.error("Login error:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background Design Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgDesigne}
          alt="Background Design"
          className="w-full h-full object-cover "
        />
      </div>

      <div className="relative z-10 flex flex-col 2xl:h-auto h-[80vh]  w-full max-w-2xl items-center gap-8 py-20 justify-center rounded-3xl bg-white px-4 sm:px-6 lg:px-8">
        <img src={Logo} alt="" className="2xl:h-40 h-25" />

        <div className=" w-[85%] mx-auto">
          <div className="text-center lg:text-start">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[gray-900]">
              {t("signIn")}
            </h2>
            <p className="mt-2  text-sm text-[#757575]">
              {t("signInSubtitle") ||
                "Enter your account details or use SSO Login"}
            </p>
          </div>

          <form className="mt-8 space-y-6 " onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField>
                <Input
                  label={t("username") || "Username"}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  error={errors.username?.message}
                  {...register("username")}
                />
              </FormField>

              <FormField>
                <PasswordInput
                  label={t("password")}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </FormField>

              <div className="flex  items-center flex-wrap gap-5 justify-between">
                <Checkbox label={t("rememberMe")} {...register("rememberMe")} />
                {/* <Link
                  to="/auth/reset"
                  className='text-sm text-[#282828] font-semibold hover:text-blue-500'
                >
                  {t('forgotPassword')}
                </Link> */}
              </div>
            </div>

            <div className="lg:space-y-4 lg:py-6">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                loading={isLoading}
              >
                {t("signIn")}
              </Button>
              {/*               
<DividerWithText>{t('or') || 'or'}</DividerWithText>

              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer"
                icon={<MicrosoftIcon />}
              >
                {t('signInWithMicrosoft')}
              </Button> */}
            </div>

            {/* <div className="text-start pb-4 ">
              <p className="text-sm text-[#282828]">
                {t('noAccount') || "Don't have an account?"}{' '}
                <Link
                  to="/auth/sign-up"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('createAccount')}
                </Link>
              </p>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
