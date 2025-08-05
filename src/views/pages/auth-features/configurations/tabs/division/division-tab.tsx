import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import type { BasicModel, UserPermission } from "@/database/models";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import { toLocaleDate } from "@/lib/utils";
import { useGlobalState } from "@/context/GlobalStateContext";
import DivisionDialog from "@/views/pages/auth-features/configurations/tabs/division/division-dialog";

interface DivisionTabProps {
  permissions: UserPermission;
}
export default function DivisionTab(props: DivisionTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const [state] = useGlobalState();

  const [loading, setLoading] = useState(false);
  const [onEdit, setOnEdit] = useState<BasicModel | undefined>(undefined);
  const [divisions, setDivisions] = useState<{
    unFilterList: BasicModel[];
    filterList: BasicModel[];
  }>({
    unFilterList: [],
    filterList: [],
  });
  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/divisions");
      if (response.status == 200) {
        setDivisions({
          unFilterList: response.data,
          filterList: response.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);
  const searchOnChange = (e: any) => {
    const { value } = e.target;
    // 1. Filter
    const filtered = divisions.unFilterList.filter((item: BasicModel) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setDivisions({
      ...divisions,
      filterList: filtered,
    });
  };
  const add = (division: BasicModel) => {
    setDivisions((prev) => ({
      unFilterList: [division, ...prev.unFilterList],
      filterList: [division, ...prev.filterList],
    }));
  };
  const edit = (division: BasicModel) => {
    setDivisions((prev) => {
      const updatedList = [...prev.unFilterList]; // clone the array
      const index = updatedList.findIndex((item) => item.id === division.id);

      if (index !== -1) {
        updatedList[index] = division; // replace at same position
      }

      return {
        unFilterList: updatedList,
        filterList: updatedList,
      };
    });

    setOnEdit(undefined);
  };

  const hasAdd = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_division
  )?.add;
  const hasDelete = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_division
  )?.delete;
  const hasEdit = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_division
  )?.edit;
  const hasView = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_division
  )?.view;
  const remove = async (division: BasicModel) => {
    try {
      // 1. Remove from backend
      const response = await axiosClient.delete(`divisions/${division.id}`);
      if (response.status === 200) {
        // 2. Remove from frontend
        setDivisions((prevJobs) => ({
          unFilterList: prevJobs.unFilterList.filter(
            (item) => item.id !== division.id
          ),
          filterList: prevJobs.filterList.filter(
            (item) => item.id !== division.id
          ),
        }));
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <div className="relative">
      <div className="rounded-md bg-card p-2 flex gap-x-4 items-baseline mt-4">
        {hasAdd &&
          useMemo(
            () => (
              <NastranModel
                visible={onEdit ? true : false}
                size="lg"
                isDismissable={false}
                button={<PrimaryButton>{t("add")}</PrimaryButton>}
                showDialog={async () => true}
              >
                <DivisionDialog
                  division={onEdit}
                  onComplete={(division: BasicModel, isEdited: boolean) =>
                    isEdited ? edit(division) : add(division)
                  }
                  onCancel={() => setOnEdit(undefined)}
                />
              </NastranModel>
            ),
            [onEdit]
          )}

        <CustomInput
          size_="lg"
          placeholder={`${t("search")}...`}
          parentClassName="w-full md:min-w-90"
          type="text"
          className="bg-card"
          onChange={searchOnChange}
          startContent={
            <Search className="size-[18px] rtl:mr-[4px] text-primary pointer-events-none" />
          }
        />
      </div>
      <Table className="bg-card rounded-md mt-1 py-8 w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {loading ? (
            <TableRow>
              <TableCell>
                <Shimmer className="h-[24px] w-full rounded-sm" />
              </TableCell>
              <TableCell>
                <Shimmer className="h-[24px] w-full rounded-sm" />
              </TableCell>
              <TableCell>
                <Shimmer className="h-[24px] w-full rounded-sm" />
              </TableCell>
            </TableRow>
          ) : (
            divisions.filterList.map((division: BasicModel, index: number) => (
              <TableRowIcon
                read={hasView}
                remove={hasDelete}
                edit={hasEdit}
                onEdit={async (division: BasicModel) => setOnEdit(division)}
                key={index}
                item={division}
                onRemove={remove}
                onRead={async () => {}}
              >
                <TableCell className="font-medium">{division.id}</TableCell>
                <TableCell>{division.name}</TableCell>
                <TableCell>
                  {toLocaleDate(new Date(division.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
