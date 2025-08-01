import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { CalendarDays, Mail, Phone, RefreshCcw, UserRound } from "lucide-react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { toLocaleDate } from "@/lib/utils";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useGlobalState } from "@/context/GlobalStateContext";
import FakeCombobox from "@/components/custom-ui/combobox/FakeCombobox";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import type { UserPermission } from "@/database/models";
import type { UserInformation } from "@/lib/types";
import { PermissionEnum } from "@/database/model-enums";
export interface EditUserInformationProps {
  id: string | undefined;
  failed: boolean;
  userData: UserInformation | undefined;
  setUserData: Dispatch<SetStateAction<UserInformation | undefined>>;
  refreshPage: () => Promise<void>;
  permissions: UserPermission;
}
export default function EditUserInformation(props: EditUserInformationProps) {
  const { id, failed, userData, setUserData, refreshPage, permissions } = props;
  const [tempUserData, setTempUserData] = useState<UserInformation | undefined>(
    userData
  );
  const [state] = useGlobalState();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    setTempUserData(userData);
  }, [userData]);
  const handleChange = (e: any) => {
    if (tempUserData) {
      const { name, value } = e.target;
      setTempUserData({ ...tempUserData, [name]: value });
    }
  };
  const saveData = async () => {
    if (loading || tempUserData === undefined || id === undefined) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // 1. Validate form
    const passed = await validate(
      [
        {
          name: "full_name",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "username",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "email",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "destination",
          rules: ["required"],
        },
        {
          name: "job",
          rules: ["required"],
        },
        {
          name: "role",
          rules: ["required"],
        },
        {
          name: "status",
          rules: ["required"],
        },
        {
          name: "grant",
          rules: ["required"],
        },
      ],
      tempUserData,
      setError
    );
    if (!passed) {
      setLoading(false);
      return;
    }
    // 2. Store
    const formData = new FormData();
    formData.append("id", id);
    formData.append("full_name", tempUserData.full_name);
    formData.append("username", tempUserData.username);
    formData.append("contact", tempUserData.contact);
    formData.append("email", tempUserData.email);
    formData.append("destination", tempUserData.department.id);
    formData.append("job", tempUserData.job.id);
    formData.append("role", tempUserData.role.id);
    try {
      const response = await axiosClient.post(
        "user/update/information",
        formData
      );
      if (response.status == 200) {
        // Update user state
        setUserData(tempUserData);
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);

      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const hasEdit = permissions.sub.get(
    PermissionEnum.users.sub.user_information
  )?.edit;
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_information")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_user_acc_info")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-x-4 gap-y-6 w-full lg:w-1/2 2xl:h-1/3">
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : tempUserData === undefined ? (
          <NastranSpinner />
        ) : (
          <>
            <CustomInput
              required={true}
              label={t("full_name")}
              requiredHint={`* ${t("required")}`}
              size_="sm"
              name="full_name"
              defaultValue={tempUserData.full_name}
              placeholder={t("enter_your_name")}
              type="text"
              errorMessage={error.get("full_name")}
              onBlur={handleChange}
              startContent={
                <UserRound className="text-tertiary size-[18px] pointer-events-none" />
              }
            />
            <CustomInput
              required={true}
              requiredHint={`* ${t("required")}`}
              size_="sm"
              label={t("username")}
              name="username"
              defaultValue={tempUserData["username"]}
              placeholder={t("enter_user_name")}
              type="text"
              errorMessage={error.get("username")}
              onBlur={handleChange}
              startContent={
                <UserRound className="text-tertiary size-[18px] pointer-events-none" />
              }
            />
            <CustomInput
              size_="sm"
              name="email"
              required={true}
              label={t("email")}
              requiredHint={`* ${t("required")}`}
              defaultValue={tempUserData["email"]}
              placeholder={t("enter_your_email")}
              type="email"
              errorMessage={error.get("email")}
              onChange={handleChange}
              startContent={
                <Mail className="text-tertiary size-[18px] pointer-events-none" />
              }
            />
            <CustomInput
              dir="ltr"
              className="rtl:text-end"
              size_="sm"
              label={t("contact")}
              placeholder={t("enter_ur_pho_num")}
              defaultValue={tempUserData["contact"]}
              type="text"
              name="contact"
              errorMessage={error.get("contact")}
              onChange={handleChange}
              startContent={
                <Phone className="text-tertiary size-[18px] pointer-events-none" />
              }
            />

            <APICombobox
              placeholderText={t("search_item")}
              errorText={t("no_item")}
              onSelect={(selection: any) =>
                setTempUserData({ ...tempUserData, ["department"]: selection })
              }
              lable={t("destination")}
              required={true}
              requiredHint={`* ${t("required")}`}
              selectedItem={tempUserData?.department?.name}
              placeHolder={t("select_destination")}
              errorMessage={error.get("destination")}
              apiUrl={"destinations"}
              mode="single"
            />

            <APICombobox
              placeholderText={t("search_item")}
              errorText={t("no_item")}
              required={true}
              requiredHint={`* ${t("required")}`}
              onSelect={(selection: any) =>
                setTempUserData({ ...tempUserData, ["job"]: selection })
              }
              lable={t("job")}
              selectedItem={tempUserData["job"]?.name}
              placeHolder={t("select_a_job")}
              errorMessage={error.get("job")}
              apiUrl={"jobs"}
              mode="single"
            />

            <APICombobox
              placeholderText={t("search_item")}
              errorText={t("no_item")}
              onSelect={(selection: any) =>
                setTempUserData({ ...tempUserData, ["role"]: selection })
              }
              required={true}
              lable={t("role")}
              requiredHint={`* ${t("required")}`}
              selectedItem={tempUserData["role"]?.name}
              placeHolder={t("select_a_role")}
              errorMessage={error.get("role")}
              apiUrl={"roles"}
              mode="single"
              translate={true}
            />
            <FakeCombobox
              icon={
                <CalendarDays className="size-[16px] text-tertiary absolute top-1/2 transform -translate-y-1/2 ltr:right-4 rtl:left-4" />
              }
              title={t("join_date")}
              selected={toLocaleDate(new Date(tempUserData.created_at), state)}
            />
          </>
        )}
      </CardContent>
      <CardFooter>
        {failed ? (
          <PrimaryButton
            onClick={async () => await refreshPage()}
            className="bg-red-500 hover:bg-red-500/70"
          >
            {t("failed_retry")}
            <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
          </PrimaryButton>
        ) : (
          tempUserData &&
          hasEdit && (
            <PrimaryButton
              disabled={loading}
              onClick={saveData}
              className={`shadow-lg`}
            >
              <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
