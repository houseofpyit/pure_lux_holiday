"""About & Company CMS routers."""

from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.dependencies.auth_dependencies import get_current_active_user, require_admin, require_editor
from app.schemas.auth import CurrentUserResponse
from app.schemas.about import (
    AboutPageResponse, AboutPageUpdate,
    CoreValueCreate, CoreValueResponse, CoreValueUpdate,
    LeadershipCreate, LeadershipResponse, LeadershipUpdate,
    TimelineCreate, TimelineResponse, TimelineUpdate,
    AwardCreate, AwardResponse, AwardUpdate,
    PartnerCreate, PartnerResponse, PartnerUpdate,
    CompanyStatisticCreate, CompanyStatisticResponse, CompanyStatisticUpdate,
    CompanyFAQCreate, CompanyFAQResponse, CompanyFAQUpdate,
    PublicAboutResponse, ReorderRequest,
)
from app.services.about_services import (
    AboutService, AwardService, CoreValueService, FAQService,
    LeadershipService, PartnerService, PublicAboutService,
    StatisticService, TimelineService,
)

# ─── About Page ────────────────────────────────────────────────
about_router = APIRouter(prefix="/about", tags=["About"])

@about_router.get("", response_model=AboutPageResponse)
async def get_about(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> AboutPageResponse:
    return await AboutService(session).get()

@about_router.put("", response_model=AboutPageResponse)
async def update_about(data: AboutPageUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> AboutPageResponse:
    return await AboutService(session).update(data)

# ─── Core Values ───────────────────────────────────────────────
cv_router = APIRouter(prefix="/about/core-values", tags=["About - Core Values"])

@cv_router.get("", response_model=list[CoreValueResponse])
async def list_values(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[CoreValueResponse]:
    return await CoreValueService(session).get_all()

@cv_router.post("", response_model=CoreValueResponse, status_code=201)
async def create_value(data: CoreValueCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CoreValueResponse:
    return await CoreValueService(session).create(data)

@cv_router.patch("/{item_id}", response_model=CoreValueResponse)
async def update_value(item_id: uuid.UUID, data: CoreValueUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CoreValueResponse:
    return await CoreValueService(session).update(item_id, data)

@cv_router.delete("/{item_id}", status_code=200)
async def delete_value(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await CoreValueService(session).delete(item_id)
    return {"message": "Deleted"}

@cv_router.put("/reorder", response_model=list[CoreValueResponse])
async def reorder_values(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[CoreValueResponse]:
    return await CoreValueService(session).reorder(data)

# ─── Leadership ────────────────────────────────────────────────
lead_router = APIRouter(prefix="/about/leadership", tags=["About - Leadership"])

@lead_router.get("", response_model=list[LeadershipResponse])
async def list_leadership(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[LeadershipResponse]:
    return await LeadershipService(session).get_all()

@lead_router.post("", response_model=LeadershipResponse, status_code=201)
async def create_leadership(data: LeadershipCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> LeadershipResponse:
    return await LeadershipService(session).create(data)

@lead_router.patch("/{item_id}", response_model=LeadershipResponse)
async def update_leadership(item_id: uuid.UUID, data: LeadershipUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> LeadershipResponse:
    return await LeadershipService(session).update(item_id, data)

@lead_router.delete("/{item_id}", status_code=200)
async def delete_leadership(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await LeadershipService(session).delete(item_id)
    return {"message": "Deleted"}

@lead_router.put("/reorder", response_model=list[LeadershipResponse])
async def reorder_leadership(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[LeadershipResponse]:
    return await LeadershipService(session).reorder(data)

# ─── Timeline ──────────────────────────────────────────────────
time_router = APIRouter(prefix="/about/timeline", tags=["About - Timeline"])

@time_router.get("", response_model=list[TimelineResponse])
async def list_timeline(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[TimelineResponse]:
    return await TimelineService(session).get_all()

@time_router.post("", response_model=TimelineResponse, status_code=201)
async def create_timeline(data: TimelineCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TimelineResponse:
    return await TimelineService(session).create(data)

@time_router.patch("/{item_id}", response_model=TimelineResponse)
async def update_timeline(item_id: uuid.UUID, data: TimelineUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> TimelineResponse:
    return await TimelineService(session).update(item_id, data)

@time_router.delete("/{item_id}", status_code=200)
async def delete_timeline(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await TimelineService(session).delete(item_id)
    return {"message": "Deleted"}

@time_router.put("/reorder", response_model=list[TimelineResponse])
async def reorder_timeline(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[TimelineResponse]:
    return await TimelineService(session).reorder(data)

# ─── Awards ────────────────────────────────────────────────────
award_router = APIRouter(prefix="/about/awards", tags=["About - Awards"])

@award_router.get("", response_model=list[AwardResponse])
async def list_awards(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[AwardResponse]:
    return await AwardService(session).get_all()

@award_router.post("", response_model=AwardResponse, status_code=201)
async def create_award(data: AwardCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> AwardResponse:
    return await AwardService(session).create(data)

@award_router.patch("/{item_id}", response_model=AwardResponse)
async def update_award(item_id: uuid.UUID, data: AwardUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> AwardResponse:
    return await AwardService(session).update(item_id, data)

@award_router.delete("/{item_id}", status_code=200)
async def delete_award(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await AwardService(session).delete(item_id)
    return {"message": "Deleted"}

@award_router.put("/reorder", response_model=list[AwardResponse])
async def reorder_awards(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[AwardResponse]:
    return await AwardService(session).reorder(data)

# ─── Partners ──────────────────────────────────────────────────
part_router = APIRouter(prefix="/about/partners", tags=["About - Partners"])

@part_router.get("", response_model=list[PartnerResponse])
async def list_partners(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[PartnerResponse]:
    return await PartnerService(session).get_all()

@part_router.post("", response_model=PartnerResponse, status_code=201)
async def create_partner(data: PartnerCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PartnerResponse:
    return await PartnerService(session).create(data)

@part_router.patch("/{item_id}", response_model=PartnerResponse)
async def update_partner(item_id: uuid.UUID, data: PartnerUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> PartnerResponse:
    return await PartnerService(session).update(item_id, data)

@part_router.delete("/{item_id}", status_code=200)
async def delete_partner(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await PartnerService(session).delete(item_id)
    return {"message": "Deleted"}

@part_router.put("/reorder", response_model=list[PartnerResponse])
async def reorder_partners(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[PartnerResponse]:
    return await PartnerService(session).reorder(data)

# ─── Statistics ────────────────────────────────────────────────
stat_router = APIRouter(prefix="/about/statistics", tags=["About - Statistics"])

@stat_router.get("", response_model=list[CompanyStatisticResponse])
async def list_statistics(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[CompanyStatisticResponse]:
    return await StatisticService(session).get_all()

@stat_router.post("", response_model=CompanyStatisticResponse, status_code=201)
async def create_statistic(data: CompanyStatisticCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CompanyStatisticResponse:
    return await StatisticService(session).create(data)

@stat_router.patch("/{item_id}", response_model=CompanyStatisticResponse)
async def update_statistic(item_id: uuid.UUID, data: CompanyStatisticUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CompanyStatisticResponse:
    return await StatisticService(session).update(item_id, data)

@stat_router.delete("/{item_id}", status_code=200)
async def delete_statistic(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await StatisticService(session).delete(item_id)
    return {"message": "Deleted"}

@stat_router.put("/reorder", response_model=list[CompanyStatisticResponse])
async def reorder_statistics(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[CompanyStatisticResponse]:
    return await StatisticService(session).reorder(data)

# ─── FAQs ──────────────────────────────────────────────────────
faq_router = APIRouter(prefix="/about/faqs", tags=["About - FAQs"])

@faq_router.get("", response_model=list[CompanyFAQResponse])
async def list_faqs(session: AsyncSession = Depends(get_db_session), _user=Depends(get_current_active_user)) -> list[CompanyFAQResponse]:
    return await FAQService(session).get_all()

@faq_router.post("", response_model=CompanyFAQResponse, status_code=201)
async def create_faq(data: CompanyFAQCreate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CompanyFAQResponse:
    return await FAQService(session).create(data)

@faq_router.patch("/{item_id}", response_model=CompanyFAQResponse)
async def update_faq(item_id: uuid.UUID, data: CompanyFAQUpdate, session: AsyncSession = Depends(get_db_session), _user=Depends(require_editor)) -> CompanyFAQResponse:
    return await FAQService(session).update(item_id, data)

@faq_router.delete("/{item_id}", status_code=200)
async def delete_faq(item_id: uuid.UUID, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> dict:
    await FAQService(session).delete(item_id)
    return {"message": "Deleted"}

@faq_router.put("/reorder", response_model=list[CompanyFAQResponse])
async def reorder_faqs(data: ReorderRequest, session: AsyncSession = Depends(get_db_session), _user=Depends(require_admin)) -> list[CompanyFAQResponse]:
    return await FAQService(session).reorder(data)

# ─── Public Endpoint ───────────────────────────────────────────
pub_router = APIRouter(prefix="/public", tags=["Public"])

@pub_router.get("/about", response_model=PublicAboutResponse, summary="Get complete about page")
async def get_public_about(session: AsyncSession = Depends(get_db_session)) -> PublicAboutResponse:
    return await PublicAboutService(session).get_public()