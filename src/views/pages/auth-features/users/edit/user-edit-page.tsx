import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import EditUserInformation from "./steps/edit-user-information";
import { EditUserPassword } from "./steps/edit-user-password";
import axiosClient from "@/lib/axois-client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, KeyRound } from "lucide-react";
import UserEditHeader from "./user-edit-header";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import { toast } from "sonner";
import type { UserPermission } from "@/database/models";
import { PermissionEnum } from "@/database/model-enums";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import type { UserInformation } from "@/lib/types";
import EditAccountStatus from "@/views/pages/auth-features/users/edit/steps/edit-account-status";

export default function UserEditPage() {
  const { user } = useUserAuthState();
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const { t, i18n } = useTranslation();
  let { id } = useParams();
  const direction = i18n.dir();
  const [failed, setFailed] = useState(false);
  const [userData, setUserData] = useState<UserInformation | undefined>();
  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`users/${id}`);
      if (response.status == 200) {
        const user = response.data.user as UserInformation;
        setUserData(user);
        if (failed) setFailed(false);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const selectedTabStyle = `shrink-0 grow-0 data-[state=active]:transition-all rtl:text-xl-rtl ltr:text-lg-ltr relative w-[95%] bg-card-foreground/5 justify-start mx-auto ltr:py-2 rtl:py-[5px] data-[state=active]:bg-tertiary font-semibold data-[state=active]:text-primary-foreground gap-x-3`;
  const per: UserPermission = user?.permissions.get(
    PermissionEnum.users.name
  ) as UserPermission;

  const tableList = Array.from(per.sub).map(
    ([key, _subPermission], index: number) => {
      return key == PermissionEnum.users.sub.user_information ? (
        <TabsTrigger
          key={index}
          className={`mt-6 ${selectedTabStyle}`}
          value={key.toString()}
        >
          <Database className="size-[18px]" />
          {t("account_information")}
        </TabsTrigger>
      ) : key == PermissionEnum.users.sub.account_status ? (
        <TabsTrigger
          key={index}
          className={`${selectedTabStyle}`}
          value={key.toString()}
        >
          <Database className="size-[18px]" />
          {t("account_status")}
        </TabsTrigger>
      ) : key == PermissionEnum.users.sub.user_password ? (
        <TabsTrigger
          key={index}
          className={`${selectedTabStyle}`}
          value={key.toString()}
        >
          <KeyRound className="size-[18px]" />
          {t("account_password")}
        </TabsTrigger>
      ) : undefined;
    }
  );
  return (
    <div className="flex flex-col gap-y-3 px-3 pt-2 pb-16">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>{t("users")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>
          {userData?.username}
        </BreadcrumbItem>
      </Breadcrumb>
      {/* Cards */}

      <Tabs
        dir={direction}
        defaultValue={PermissionEnum.users.sub.user_information.toString()}
        className="flex flex-col md:flex-row gap-y-2 gap-x-6"
      >
        <TabsList className="h-fit overflow-x-auto flex-col w-full md:w-fit md:min-w-80 bg-card border gap-4 pb-12">
          <UserEditHeader userData={userData} />
          {tableList}
        </TabsList>
        <TabsContent
          className=" overflow-x-hidden"
          value={PermissionEnum.users.sub.user_information.toString()}
        >
          <EditUserInformation
            id={id}
            failed={failed}
            userData={userData}
            setUserData={setUserData}
            refreshPage={loadInformation}
            permissions={per}
          />
        </TabsContent>
        <TabsContent value={PermissionEnum.users.sub.user_password.toString()}>
          <EditUserPassword
            id={id}
            userData={userData}
            failed={failed}
            refreshPage={loadInformation}
            permissions={per}
          />
        </TabsContent>
        <TabsContent value={PermissionEnum.users.sub.account_status.toString()}>
          <EditAccountStatus permissions={per} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
